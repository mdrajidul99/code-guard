import { ProcessingProgress, SecuritySettings } from '../types/index.ts';
import { minifyBloggerSkinWithDirectives, minifyCss } from './cssEngine.ts';
import {
  buildAntiInspectScript,
  buildDomainLockGuardScript,
  buildObfuscatorOptions,
  parseDomainList,
  sanitizeObfuscatedTagBoundaries,
  splitModuleImports,
} from './jsHelpers.ts';
import { obfuscateInWorker } from './workerClient.ts';

export interface BloggerProcessResult {
  output: string;
  scriptsObfuscated: number;
  cssHidden: boolean;
  htmlHidden: boolean;
  domainLockActive: boolean;
  xmlValidationError: string | null;
}

const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * Validates XML structure using the browser's DOMParser.
 * Returns null if valid XML, or a descriptive error message if malformed.
 */
export function validateBloggerXml(xmlString: string): string | null {
  if (typeof DOMParser === 'undefined') return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return parserError.textContent?.trim() || 'Unknown XML Syntax Validation Error';
    }
    return null;
  } catch (err: unknown) {
    return err instanceof Error ? err.message : String(err);
  }
}

/**
 * Checks if a <script> tag is an AdSense, Google Analytics, or GTM script
 * that must NEVER be altered or obfuscated.
 */
function isProtectedAnalyticsOrAdSense(attrs: string, content: string): boolean {
  const combined = attrs + '\n' + content;
  return (
    /googlesyndication\.com/i.test(combined) ||
    /googletagmanager\.com/i.test(combined) ||
    /google-analytics\.com/i.test(combined) ||
    /\badsbygoogle\b/i.test(combined) ||
    /\bGoogleAnalyticsObject\b/i.test(combined) ||
    /\bgtag\s*\(/i.test(content) ||
    /\bdataLayer\s*=\s*window\.dataLayer/i.test(content)
  );
}

/**
 * Finds and replaces ONLY top-level static HTML container blocks inside <body>
 * that contain ZERO Blogger tags (<b:...>, </b:...>, <data:...>, expr:) and ZERO <script>/<style> tags.
 * Uses a strict balanced tag scanner so XML nesting (e.g. <b:includable>) is never broken.
 */
async function hidePureStaticBodyBlocks(
  bodyInner: string,
  obfuscateFn: (code: string) => Promise<string>
): Promise<{ result: string; hiddenCount: number; scriptsAdded: number }> {
  const targetTags = new Set(['header', 'footer', 'nav', 'aside', 'div', 'section']);
  let hiddenCount = 0;
  let scriptsAdded = 0;
  let mountCounter = 1;

  // Scan from left to right at top-level of bodyInner
  let output = '';
  let pos = 0;
  const len = bodyInner.length;

  while (pos < len) {
    const nextLt = bodyInner.indexOf('<', pos);
    if (nextLt === -1) {
      output += bodyInner.slice(pos);
      break;
    }

    output += bodyInner.slice(pos, nextLt);

    // Check if this is an XML/HTML comment
    if (bodyInner.startsWith('<!--', nextLt)) {
      const commentEnd = bodyInner.indexOf('-->', nextLt + 4);
      const end = commentEnd === -1 ? len : commentEnd + 3;
      output += bodyInner.slice(nextLt, end);
      pos = end;
      continue;
    }

    // Read opening tag
    const tagMatch = /^<([a-zA-Z][a-zA-Z0-9:-]*)(\s[^>]*)?(\/?)>/.exec(bodyInner.slice(nextLt));
    if (!tagMatch) {
      output += '<';
      pos = nextLt + 1;
      continue;
    }

    const fullOpenTag = tagMatch[0];
    const tagName = tagMatch[1].toLowerCase();
    const isSelfClosing = tagMatch[3] === '/' || VOID_HTML_TAGS.has(tagName);

    // If it's a Blogger tag (<b:section>, <b:widget>, etc.) or <script> or <style>, skip to its matching closing tag verbatim!
    if (tagName.startsWith('b:') || tagName === 'script' || tagName === 'style' || targetTags.has(tagName)) {
      if (isSelfClosing) {
        output += fullOpenTag;
        pos = nextLt + fullOpenTag.length;
        continue;
      }

      // Find balanced closing </tagName>
      let depth = 1;
      let scan = nextLt + fullOpenTag.length;
      const openRegex = new RegExp(`<${tagName.replace(':', '\\:')}(?:\\s[^>]*)?(/?)>`, 'gi');
      const closeRegex = new RegExp(`<\\/${tagName.replace(':', '\\:')}\\s*>`, 'gi');

      while (depth > 0 && scan < len) {
        openRegex.lastIndex = scan;
        closeRegex.lastIndex = scan;
        const nextOpen = openRegex.exec(bodyInner);
        const nextClose = closeRegex.exec(bodyInner);

        if (!nextClose) {
          // Unbalanced fallback — abort replacement for this tag
          scan = len;
          break;
        }

        if (nextOpen && nextOpen.index < nextClose.index) {
          const selfCloseNested = nextOpen[1] === '/' || VOID_HTML_TAGS.has(tagName);
          if (!selfCloseNested) depth++;
          scan = nextOpen.index + nextOpen[0].length;
        } else {
          depth--;
          scan = nextClose.index + nextClose[0].length;
        }
      }

      if (depth !== 0) {
        // Could not balance cleanly — keep original character by character
        output += fullOpenTag;
        pos = nextLt + fullOpenTag.length;
        continue;
      }

      const fullBlock = bodyInner.slice(nextLt, scan);

      // Only hide if:
      // 1. It is one of our pure HTML block tags (NOT b:*, script, style)
      // 2. Contains ZERO Blogger tags/directives (<b:, </b:, <data:, expr:)
      // 3. Contains ZERO <script or <style tags
      // 4. Meaningful size (>= 40 chars)
      const hasBloggerDirective = /<b:|<\/b:|<data:|<expr:|\bexpr:/i.test(fullBlock);
      const hasEmbeddedScriptOrStyle = /<script\b|<style\b/i.test(fullBlock);

      if (
        targetTags.has(tagName) &&
        !hasBloggerDirective &&
        !hasEmbeddedScriptOrStyle &&
        fullBlock.trim().length >= 40
      ) {
        const mountId = `cg-xml-mount-${mountCounter++}`;
        const cleanBlock = fullBlock.replace(/\s+/g, ' ').trim();
        const mountCode = `(function(){var m=document.getElementById('${mountId}');if(m){m.innerHTML=${JSON.stringify(cleanBlock)};}})();`;
        const obfMount = sanitizeObfuscatedTagBoundaries(await obfuscateFn(mountCode));
        output += `<div id='${mountId}'></div>\n<script type='text/javascript'>\n//<![CDATA[\n${obfMount}\n//]]>\n</script>`;
        hiddenCount++;
        scriptsAdded++;
      } else {
        output += fullBlock;
      }

      pos = scan;
      continue;
    }

    output += fullOpenTag;
    pos = nextLt + fullOpenTag.length;
  }

  return { result: output, hiddenCount, scriptsAdded };
}

/**
 * Mode 2: Blogger XML (Theme & Widget Code) processing pipeline.
 * - Preserves all <?xml?>, <!DOCTYPE>, namespaces, <b:include/>, <b:template-skin>,
 *   <b:section>, <b:widget>, <b:includable>, <b:if>, <b:loop>, <data:...>, expr:, AdSense/Analytics.
 * - Handles <b:skin> safely (hides pure CSS in obfuscated JS injector, or preserves <Variable>/<Group>/<b:if>).
 * - Wraps every obfuscated script inside <script type='text/javascript'>\n//<![CDATA[\n...\n//]]>\n</script>.
 * - Ensures obfuscated JS never contains raw `]]>`.
 * - Runs DOMParser XML validation on final output.
 */
export async function processBloggerXml(
  xmlCode: string,
  settings: SecuritySettings,
  options: {
    forPreview?: boolean;
    onProgress?: (progress: ProcessingProgress) => void;
  } = {}
): Promise<BloggerProcessResult> {
  const trimmed = xmlCode.trim();
  if (!trimmed) {
    throw new Error('Input Blogger XML code is empty.');
  }

  const forPreview = Boolean(options.forPreview);
  const onProgress = options.onProgress;

  const domains = parseDomainList(settings.domainLock, 'blogger', settings.allowBloggerPreview);
  const obfOptions = buildObfuscatorOptions(settings, domains, forPreview);
  const domainLockActive = !forPreview && domains.length > 0;

  let working = trimmed;
  let scriptsObfuscated = 0;
  let cssHidden = false;
  let htmlHidden = false;

  const obfuscateSafe = (code: string) => obfuscateInWorker(code, obfOptions);

  // --- STEP 1: Domain Lock Guard (in <head>) ---
  let domainGuardXml = '';
  if (domainLockActive) {
    onProgress?.({ stage: 'ডোমেইন লক সুরক্ষা তৈরি হচ্ছে...', percent: 10 });
    const guardObf = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(buildDomainLockGuardScript(domains)));
    domainGuardXml = `<script type='text/javascript'>\n//<![CDATA[\n${guardObf}\n//]]>\n</script>`;
    scriptsObfuscated++;
  }

  // --- STEP 2: <b:skin> CSS Processing ---
  onProgress?.({ stage: 'CSS এনকোড হচ্ছে...', percent: 25 });
  let skinCssInjectorXml = '';

  const skinRegex = /(<b:skin\b[^>]*>\s*<!\[CDATA\[)([\s\S]*?)(\]\]>\s*<\/b:skin>)/gi;
  const skinMatches: Array<{ match: string; open: string; inner: string; close: string }> = [];
  let sm: RegExpExecArray | null;
  while ((sm = skinRegex.exec(working)) !== null) {
    skinMatches.push({ match: sm[0], open: sm[1], inner: sm[2], close: sm[3] });
  }

  for (const item of skinMatches) {
    const hasBloggerVarsOrIf = /<Variable\b|<Group\b|<b:/i.test(item.inner);
    if (hasBloggerVarsOrIf) {
      // Preserve Blogger variables, groups, and conditionals safely
      const safeMinified = minifyBloggerSkinWithDirectives(item.inner);
      working = working.replace(item.match, () => `${item.open}\n${safeMinified}\n${item.close}`);
    } else if (settings.hideCssAndHtmlInJs) {
      const minified = minifyCss(item.inner);
      if (minified) {
        const cssJs = `(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(minified)};(document.head||document.documentElement).appendChild(s);})();`;
        const obfCss = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(cssJs));
        skinCssInjectorXml += `\n<script type='text/javascript'>\n//<![CDATA[\n${obfCss}\n//]]>\n</script>`;
        working = working.replace(item.match, () => `${item.open}/*Secured by CodeGuard*/${item.close}`);
        cssHidden = true;
        scriptsObfuscated++;
      }
    } else {
      const minified = minifyCss(item.inner);
      working = working.replace(item.match, () => `${item.open}\n${minified}\n${item.close}`);
    }
  }

  // Also handle standalone <style> blocks in <head> (only if no Blogger tags inside)
  let standaloneCssInjectorXml = '';
  if (settings.hideCssAndHtmlInJs) {
    const headMatch = /(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i.exec(working);
    if (headMatch) {
      const collectedHeadStyles: string[] = [];
      let headInner = headMatch[2].replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (full, _o, cssInner) => {
        if (/<b:|<\/b:|<data:|<expr:/i.test(cssInner)) return full;
        const min = minifyCss(cssInner);
        if (min) collectedHeadStyles.push(min);
        return '';
      });

      if (collectedHeadStyles.length > 0) {
        const merged = collectedHeadStyles.join('\n');
        const cssJs = `(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(merged)};(document.head||document.documentElement).appendChild(s);})();`;
        const obfCss = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(cssJs));
        standaloneCssInjectorXml = `\n<script type='text/javascript'>\n//<![CDATA[\n${obfCss}\n//]]>\n</script>`;
        cssHidden = true;
        scriptsObfuscated++;
      }

      working =
        working.slice(0, headMatch.index) +
        `${headMatch[1]}${headInner}${headMatch[3]}` +
        working.slice(headMatch.index + headMatch[0].length);
    }
  }

  // --- STEP 3: Obfuscate Custom <script> & <script type='module'> tags ---
  onProgress?.({ stage: 'Scripts এনকোড হচ্ছে...', percent: 50 });

  const scriptSlots: Array<{ token: string; replacement: string }> = [];
  let scriptIndex = 0;

  // Tokenize matching scripts first so async Worker calls happen cleanly
  const scriptCandidates: Array<{ token: string; openTag: string; attrs: string; content: string; closeTag: string; rawMatch: string }> = [];

  working = working.replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/gi, (rawMatch, openTag, attrs, content, closeTag) => {
    // 1. Skip external scripts (src=)
    if (/\bsrc\s*=/i.test(attrs)) return rawMatch;
    // 2. Skip self-closing scripts
    if (openTag.trim().endsWith('/>')) return rawMatch;
    // 3. Skip JSON-LD, templates, importmaps
    if (/\btype\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template|text\/x-template|importmap)["']?/i.test(attrs)) return rawMatch;
    // 4. Skip AdSense / Analytics scripts
    if (isProtectedAnalyticsOrAdSense(attrs, content)) return rawMatch;
    // 5. Skip nested <script> tags (safety against self-closing mismatch)
    if (/<script\b/i.test(content)) return rawMatch;
    // 6. Skip scripts containing Blogger server tags (<b:, </b:, <data:, <expr:)
    if (/<b:|<\/b:|<data:|<expr:/i.test(content)) return rawMatch;
    // 7. Skip empty scripts
    if (!content.trim()) return rawMatch;

    const token = `__CG_XML_SCRIPT_${scriptIndex++}__`;
    scriptCandidates.push({ token, openTag, attrs, content, closeTag, rawMatch });
    return token;
  });

  for (const cand of scriptCandidates) {
    // Strip existing CDATA markers
    let rawJs = cand.content.trim();
    rawJs = rawJs
      .replace(/\/\/<!\[CDATA\[/gi, '')
      .replace(/\/\/\]\]>/gi, '')
      .replace(/<!\[CDATA\[/gi, '')
      .replace(/\]\]>/gi, '')
      .trim();

    if (!rawJs) {
      scriptSlots.push({ token: cand.token, replacement: cand.rawMatch });
      continue;
    }

    const isModule = /\btype\s*=\s*["']?module["']?/i.test(cand.attrs);

    if (isModule) {
      const { imports, body } = splitModuleImports(rawJs);
      if (!body.trim()) {
        scriptSlots.push({ token: cand.token, replacement: cand.rawMatch });
        continue;
      }
      const obfBody = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(body));
      scriptsObfuscated++;
      const combined = imports ? `${imports}\n${obfBody}` : obfBody;
      scriptSlots.push({
        token: cand.token,
        replacement: `<script type='module'>\n//<![CDATA[\n${combined}\n//]]>\n</script>`,
      });
    } else {
      const obfJs = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(rawJs));
      scriptsObfuscated++;
      scriptSlots.push({
        token: cand.token,
        replacement: `<script type='text/javascript'>\n//<![CDATA[\n${obfJs}\n//]]>\n</script>`,
      });
    }
  }

  // --- STEP 4: Hide Pure Static HTML Blocks inside <body> (preserving ALL Blogger tags) ---
  if (settings.hideCssAndHtmlInJs) {
    const bodyMatch = /(<body\b[^>]*>)([\s\S]*?)(<\/body>)/i.exec(working);
    if (bodyMatch) {
      onProgress?.({ stage: 'HTML এনকোড হচ্ছে...', percent: 72 });
      const { result: protectedBody, hiddenCount, scriptsAdded } = await hidePureStaticBodyBlocks(
        bodyMatch[2],
        obfuscateSafe
      );
      if (hiddenCount > 0) {
        htmlHidden = true;
        scriptsObfuscated += scriptsAdded;
      }
      working =
        working.slice(0, bodyMatch.index) +
        `${bodyMatch[1]}${protectedBody}${bodyMatch[3]}` +
        working.slice(bodyMatch.index + bodyMatch[0].length);
    }
  }

  // Restore obfuscated script tokens back into XML
  for (const slot of scriptSlots) {
    working = working.replace(slot.token, () => slot.replacement);
  }

  // Inject <head> scripts (Domain Lock + CSS Injector) before </head>
  const headInjectors = [domainGuardXml, skinCssInjectorXml, standaloneCssInjectorXml].filter(Boolean).join('\n');
  if (headInjectors) {
    if (/<\/head>/i.test(working)) {
      working = working.replace(/<\/head>/i, () => `${headInjectors}\n</head>`);
    } else {
      working = `${headInjectors}\n${working}`;
    }
  }

  // --- STEP 5: Anti-Inspect & Anti-Copy Guard before </body> ---
  if (settings.antiInspectAndCopy) {
    onProgress?.({ stage: 'Anti-Inspect ও Anti-Copy সুরক্ষা তৈরি হচ্ছে...', percent: 88 });
    const antiObf = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(buildAntiInspectScript()));
    const antiXml = `<script type='text/javascript'>\n//<![CDATA[\n${antiObf}\n//]]>\n</script>`;
    scriptsObfuscated++;

    if (/<\/body>/i.test(working)) {
      working = working.replace(/<\/body>/i, () => `${antiXml}\n</body>`);
    } else {
      working = `${working}\n${antiXml}`;
    }
  }

  // --- STEP 6: Mandatory XML Validation via DOMParser ---
  onProgress?.({ stage: 'XML ভ্যালিডেশন চেক হচ্ছে...', percent: 96 });
  const finalOutput = working.trim();
  const xmlValidationError = validateBloggerXml(finalOutput);

  onProgress?.({ stage: 'সম্পন্ন হচ্ছে...', percent: 100 });

  return {
    output: finalOutput,
    scriptsObfuscated,
    cssHidden,
    htmlHidden,
    domainLockActive,
    xmlValidationError,
  };
}
