import { ProcessingProgress, SecuritySettings } from '../types/index.ts';
import { minifyBloggerSkinWithDirectives, minifyCss } from './cssEngine.ts';
import {
  buildAntiInspectScript,
  buildDomainLockGuardScript,
  buildObfuscatorOptions,
  parseDomainList,
  sanitizeObfuscatedTagBoundaries,
  splitModuleImports,
  wrapModuleBodyForObfuscation,
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

interface UiMountEntry {
  id: string;
  html: string;
}

const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const CONTAINER_UI_TAGS = new Set(['header', 'footer', 'nav', 'aside', 'section', 'main', 'div']);
const BLOGGER_STRUCTURAL_CONTAINERS = new Set(['b:section', 'b:widget', 'b:includable', 'b:if', 'b:else']);
const VERBATIM_SKIP_TAGS = new Set(['script', 'style', 'b:loop', 'b:skin', 'b:template-skin', 'svg', 'pre', 'code', 'textarea']);

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
 * Finds the end index (after closing `>`) of an XML/HTML opening tag starting at `startIdx`,
 * safely skipping quoted attribute values (`'...'` and `"..."`).
 */
function findTagEnd(source: string, startIdx: number): { endIdx: number; isSelfClosing: boolean } | null {
  let i = startIdx + 1;
  const len = source.length;
  let quote: '"' | "'" | null = null;

  while (i < len) {
    const ch = source[i];
    if (quote) {
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      i++;
      continue;
    }
    if (ch === '>') {
      // Check if preceded by '/' ignoring whitespace
      let j = i - 1;
      while (j > startIdx && /\s/.test(source[j])) j--;
      return { endIdx: i + 1, isSelfClosing: source[j] === '/' };
    }
    i++;
  }
  return null;
}

/**
 * Finds the matching closing `</tagName>` starting right after an opening tag,
 * tracking nested `<tagName>` / `</tagName>` safely while respecting quotes and comments.
 */
function findMatchingCloseTag(
  source: string,
  afterOpenIdx: number,
  tagName: string
): { innerEndIdx: number; afterCloseIdx: number } | null {
  const lowerTag = tagName.toLowerCase();
  let depth = 1;
  let pos = afterOpenIdx;
  const len = source.length;

  while (pos < len && depth > 0) {
    const lt = source.indexOf('<', pos);
    if (lt === -1) return null;

    if (source.startsWith('<!--', lt)) {
      const cEnd = source.indexOf('-->', lt + 4);
      pos = cEnd === -1 ? len : cEnd + 3;
      continue;
    }
    if (source.startsWith('<![CDATA[', lt)) {
      const cdEnd = source.indexOf(']]>', lt + 9);
      pos = cdEnd === -1 ? len : cdEnd + 3;
      continue;
    }

    // Check closing tag
    if (source[lt + 1] === '/') {
      const closeMatch = /^<\/([a-zA-Z][a-zA-Z0-9:-]*)\s*>/.exec(source.slice(lt));
      if (closeMatch) {
        if (closeMatch[1].toLowerCase() === lowerTag) {
          depth--;
          if (depth === 0) {
            return {
              innerEndIdx: lt,
              afterCloseIdx: lt + closeMatch[0].length,
            };
          }
        }
        pos = lt + closeMatch[0].length;
        continue;
      }
      pos = lt + 2;
      continue;
    }

    // Check opening tag
    const nameMatch = /^<([a-zA-Z][a-zA-Z0-9:-]*)(?=[\s/>])/.exec(source.slice(lt));
    if (nameMatch) {
      const tagEnd = findTagEnd(source, lt);
      if (!tagEnd) return null;
      const foundName = nameMatch[1].toLowerCase();
      if (foundName === lowerTag && !tagEnd.isSelfClosing && !VOID_HTML_TAGS.has(foundName)) {
        depth++;
      }
      pos = tagEnd.endIdx;
      continue;
    }

    pos = lt + 1;
  }

  return null;
}

/**
 * Picks or injects an ID onto an opening HTML tag without altering its tag name,
 * CSS classes, or flex-child structural position (preserves header/footer flex layouts).
 */
function ensureMountIdOnOpenTag(
  openTag: string,
  tagName: string,
  inHomepageOrWidget: boolean,
  usedIds: Set<string>,
  counters: { home: number; ui: number }
): { updatedOpenTag: string; mountId: string } {
  const existingIdMatch = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(openTag);
  if (existingIdMatch) {
    const existingId = (existingIdMatch[1] || existingIdMatch[2] || '').trim();
    if (existingId && !usedIds.has(existingId)) {
      usedIds.add(existingId);
      return { updatedOpenTag: openTag, mountId: existingId };
    }
  }

  let candidate = '';
  if (tagName === 'header' && !usedIds.has('cg-header-mount')) {
    candidate = 'cg-header-mount';
  } else if (tagName === 'footer' && !usedIds.has('cg-footer-mount')) {
    candidate = 'cg-footer-mount';
  } else if (inHomepageOrWidget) {
    if (!usedIds.has('cg-home-mount')) {
      candidate = 'cg-home-mount';
    } else {
      do {
        counters.home++;
        candidate = `cg-home-mount-${counters.home}`;
      } while (usedIds.has(candidate));
    }
  } else {
    do {
      counters.ui++;
      candidate = `cg-ui-mount-${counters.ui}`;
    } while (usedIds.has(candidate));
  }

  usedIds.add(candidate);

  // Replace existing duplicate id if present, otherwise insert id='...' cleanly
  if (existingIdMatch) {
    const updated = openTag.replace(
      /\bid\s*=\s*(?:"[^"]*"|'[^']*')/i,
      `id='${candidate}'`
    );
    return { updatedOpenTag: updated, mountId: candidate };
  }

  const updated = openTag.replace(/>$/, ` id='${candidate}'>`);
  return { updatedOpenTag: updated, mountId: candidate };
}

/**
 * Recursively collects pure static HTML blocks (in top-level body, drawers/modals,
 * and inside <b:widget> / <b:includable> / <b:if> blocks that lack <data:...>, <b:loop>,
 * <b:include>, or expr:), preserving original outer tags (e.g. <header>, <footer>, <section>)
 * and returning all mounts to be bundled into ONE combined JS script.
 */
function collectAndStripStaticUiBlocks(
  fragment: string,
  mounts: UiMountEntry[],
  usedIds: Set<string>,
  counters: { home: number; ui: number },
  inHomepageOrWidget: boolean
): string {
  let output = '';
  let pos = 0;
  const len = fragment.length;

  while (pos < len) {
    const lt = fragment.indexOf('<', pos);
    if (lt === -1) {
      output += fragment.slice(pos);
      break;
    }

    output += fragment.slice(pos, lt);

    // Comments & CDATA pass through verbatim
    if (fragment.startsWith('<!--', lt)) {
      const cEnd = fragment.indexOf('-->', lt + 4);
      const end = cEnd === -1 ? len : cEnd + 3;
      output += fragment.slice(lt, end);
      pos = end;
      continue;
    }
    if (fragment.startsWith('<![CDATA[', lt)) {
      const cdEnd = fragment.indexOf(']]>', lt + 9);
      const end = cdEnd === -1 ? len : cdEnd + 3;
      output += fragment.slice(lt, end);
      pos = end;
      continue;
    }

    const nameMatch = /^<([a-zA-Z][a-zA-Z0-9:-]*)(?=[\s/>])/.exec(fragment.slice(lt));
    if (!nameMatch) {
      output += '<';
      pos = lt + 1;
      continue;
    }

    const tagEnd = findTagEnd(fragment, lt);
    if (!tagEnd) {
      output += '<';
      pos = lt + 1;
      continue;
    }

    const openTag = fragment.slice(lt, tagEnd.endIdx);
    const tagName = nameMatch[1].toLowerCase();
    const isSelfClosing = tagEnd.isSelfClosing || VOID_HTML_TAGS.has(tagName);

    if (isSelfClosing) {
      output += openTag;
      pos = tagEnd.endIdx;
      continue;
    }

    const isTargetUiContainer = CONTAINER_UI_TAGS.has(tagName);
    const isBloggerStructural = BLOGGER_STRUCTURAL_CONTAINERS.has(tagName);
    const isVerbatimSkip = VERBATIM_SKIP_TAGS.has(tagName);

    if (!isTargetUiContainer && !isBloggerStructural && !isVerbatimSkip) {
      output += openTag;
      pos = tagEnd.endIdx;
      continue;
    }

    const closeInfo = findMatchingCloseTag(fragment, tagEnd.endIdx, tagName);
    if (!closeInfo) {
      output += openTag;
      pos = tagEnd.endIdx;
      continue;
    }

    const innerContent = fragment.slice(tagEnd.endIdx, closeInfo.innerEndIdx);
    const closeTag = fragment.slice(closeInfo.innerEndIdx, closeInfo.afterCloseIdx);

    if (isVerbatimSkip) {
      output += openTag + innerContent + closeTag;
      pos = closeInfo.afterCloseIdx;
      continue;
    }

    if (isBloggerStructural) {
      const nextContext =
        inHomepageOrWidget || tagName === 'b:widget' || tagName === 'b:includable' || tagName === 'b:if';

      // Check if <b:if> wraps pure static HTML directly without outer container tags
      let processedInner = collectAndStripStaticUiBlocks(
        innerContent,
        mounts,
        usedIds,
        counters,
        nextContext
      );

      if (tagName === 'b:if') {
        const hasBloggerInside = /<b:|<\/b:|<data:|<expr:|\bexpr:/i.test(processedInner);
        const hasScriptOrStyle = /<script\b|<style\b|__CG_XML_SCRIPT_/i.test(processedInner);
        const alreadyMountedOnly = /^(\s*<[a-zA-Z0-9:-]+[^>]*id=['"]cg-[^'"]+['"][^>]*>\s*<\/[a-zA-Z0-9:-]+>\s*)+$/.test(processedInner);

        if (!hasBloggerInside && !hasScriptOrStyle && !alreadyMountedOnly && processedInner.trim().length >= 35) {
          let homeId = 'cg-home-mount';
          if (usedIds.has(homeId)) {
            do {
              counters.home++;
              homeId = `cg-home-mount-${counters.home}`;
            } while (usedIds.has(homeId));
          }
          usedIds.add(homeId);
          mounts.push({
            id: homeId,
            html: processedInner.replace(/\s+/g, ' ').trim(),
          });
          processedInner = `<div id='${homeId}'></div>`;
        }
      }

      output += `${openTag}${processedInner}${closeTag}`;
      pos = closeInfo.afterCloseIdx;
      continue;
    }

    // Target UI Container (<header>, <footer>, <nav>, <aside>, <section>, <main>, <div>)
    const fullBlock = openTag + innerContent + closeTag;
    const hasBloggerDirective = /<b:|<\/b:|<data:|<expr:|\bexpr:/i.test(fullBlock);
    const hasEmbeddedScriptOrStyle = /<script\b|<style\b|__CG_XML_SCRIPT_/i.test(fullBlock);

    if (!hasBloggerDirective && !hasEmbeddedScriptOrStyle && innerContent.trim().length >= 30) {
      // Pure static UI block — keep the exact outer tag (<header>, <footer>, <section>, etc.) so CSS/flex layouts never break!
      const { updatedOpenTag, mountId } = ensureMountIdOnOpenTag(
        openTag,
        tagName,
        inHomepageOrWidget,
        usedIds,
        counters
      );
      mounts.push({
        id: mountId,
        html: innerContent.replace(/\s+/g, ' ').trim(),
      });
      output += `${updatedOpenTag}${closeTag}`;
    } else {
      // Container wraps Blogger tags or scripts — keep wrapper and recurse into inner HTML cleanly
      const processedInner = collectAndStripStaticUiBlocks(
        innerContent,
        mounts,
        usedIds,
        counters,
        inHomepageOrWidget
      );
      output += `${openTag}${processedInner}${closeTag}`;
    }

    pos = closeInfo.afterCloseIdx;
  }

  return output;
}

/**
 * Mode 2: Blogger XML (Theme & Widget Code) processing pipeline.
 * Produces clean, lightweight, fast-loading Blogger XML with at most ~4 scripts:
 *   1) <head>: Combined CSS injector + optional Domain Lock guard
 *   2) <body>: ONE single combined UI mount script (preserving <header>, <footer>, <section> outer tags & flex layout,
 *      and hiding pure static <b:if>/<b:widget> homepage sections while keeping SEO <b:loop>/<data:post.*> intact)
 *   3) <script type='module'>: Top-level imports preserved + body wrapped in (async function(){...})(); for full obfuscation
 *   4) Before </body>: Anti-Inspect & Anti-Copy script
 * All scripts wrapped in //<![CDATA[ ... //]]> with zero stray `]]>` and validated via DOMParser.
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

  // --- STEP 1: Combine Domain Lock Guard + <b:skin> / <style> CSS Injector into ONE <head> script ---
  onProgress?.({ stage: 'CSS ও ডোমেইন লক প্রস্তুত হচ্ছে...', percent: 18 });
  const headJsParts: string[] = [];

  if (domainLockActive) {
    headJsParts.push(buildDomainLockGuardScript(domains));
  }

  const skinRegex = /(<b:skin\b[^>]*>\s*<!\[CDATA\[)([\s\S]*?)(\]\]>\s*<\/b:skin>)/gi;
  const skinMatches: Array<{ match: string; open: string; inner: string; close: string }> = [];
  let sm: RegExpExecArray | null;
  while ((sm = skinRegex.exec(working)) !== null) {
    skinMatches.push({ match: sm[0], open: sm[1], inner: sm[2], close: sm[3] });
  }

  const allHiddenCssChunks: string[] = [];
  for (const item of skinMatches) {
    const hasBloggerVarsOrIf = /<Variable\b|<Group\b|<b:/i.test(item.inner);
    if (hasBloggerVarsOrIf) {
      const safeMinified = minifyBloggerSkinWithDirectives(item.inner);
      working = working.replace(item.match, () => `${item.open}\n${safeMinified}\n${item.close}`);
    } else if (settings.hideCssAndHtmlInJs) {
      const minified = minifyCss(item.inner);
      if (minified) {
        allHiddenCssChunks.push(minified);
        working = working.replace(item.match, () => `${item.open}/*Secured by CodeGuard*/${item.close}`);
        cssHidden = true;
      }
    } else {
      const minified = minifyCss(item.inner);
      working = working.replace(item.match, () => `${item.open}\n${minified}\n${item.close}`);
    }
  }

  if (settings.hideCssAndHtmlInJs) {
    const headMatch = /(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i.exec(working);
    if (headMatch) {
      const headInner = headMatch[2].replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (full, _o, cssInner) => {
        if (/<b:|<\/b:|<data:|<expr:/i.test(cssInner)) return full;
        const min = minifyCss(cssInner);
        if (min) allHiddenCssChunks.push(min);
        cssHidden = true;
        return '';
      });
      working =
        working.slice(0, headMatch.index) +
        `${headMatch[1]}${headInner}${headMatch[3]}` +
        working.slice(headMatch.index + headMatch[0].length);
    }
  }

  if (allHiddenCssChunks.length > 0) {
    const mergedCss = allHiddenCssChunks.join('\n');
    headJsParts.push(
      `(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(mergedCss)};(document.head||document.documentElement).appendChild(s);})();`
    );
  }

  let headCombinedScriptXml = '';
  if (headJsParts.length > 0) {
    onProgress?.({ stage: 'CSS এনকোড হচ্ছে...', percent: 28 });
    const obfHead = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(headJsParts.join('\n')));
    headCombinedScriptXml = `<script type='text/javascript'>\n//<![CDATA[\n${obfHead}\n//]]>\n</script>`;
    scriptsObfuscated++;
  }

  // --- STEP 2: Tokenize Custom <script> & <script type='module'> tags BEFORE scanning HTML ---
  onProgress?.({ stage: 'Scripts এনকোড হচ্ছে...', percent: 48 });

  const scriptSlots: Array<{ token: string; replacement: string; isModule: boolean }> = [];
  let scriptIndex = 0;

  const scriptCandidates: Array<{
    token: string;
    openTag: string;
    attrs: string;
    content: string;
    closeTag: string;
    rawMatch: string;
  }> = [];

  working = working.replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/gi, (rawMatch, openTag, attrs, content, closeTag) => {
    if (/\bsrc\s*=/i.test(attrs)) return rawMatch;
    if (openTag.trim().endsWith('/>')) return rawMatch;
    if (/\btype\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template|text\/x-template|importmap)["']?/i.test(attrs)) {
      return rawMatch;
    }
    if (isProtectedAnalyticsOrAdSense(attrs, content)) return rawMatch;
    if (/<script\b/i.test(content)) return rawMatch;
    if (/<b:|<\/b:|<data:|<expr:/i.test(content)) return rawMatch;
    if (!content.trim()) return rawMatch;

    const token = `__CG_XML_SCRIPT_${scriptIndex++}__`;
    scriptCandidates.push({ token, openTag, attrs, content, closeTag, rawMatch });
    return token;
  });

  for (const cand of scriptCandidates) {
    let rawJs = cand.content.trim();
    rawJs = rawJs
      .replace(/\/\/<!\[CDATA\[/gi, '')
      .replace(/\/\/\]\]>/gi, '')
      .replace(/<!\[CDATA\[/gi, '')
      .replace(/\]\]>/gi, '')
      .trim();

    if (!rawJs) {
      scriptSlots.push({ token: cand.token, replacement: cand.rawMatch, isModule: false });
      continue;
    }

    const isModule = /\btype\s*=\s*["']?module["']?/i.test(cand.attrs);

    if (isModule) {
      const { imports, body } = splitModuleImports(rawJs);
      if (!body.trim()) {
        scriptSlots.push({ token: cand.token, replacement: cand.rawMatch, isModule: true });
        continue;
      }
      // Wrap post-import module body in async IIFE so firebaseConfig, ADMIN_EMAIL, and local functions are obfuscated
      const wrappedBody = wrapModuleBodyForObfuscation(body);
      const obfBody = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(wrappedBody));
      scriptsObfuscated++;
      const combined = imports ? `${imports}\n${obfBody}` : obfBody;
      scriptSlots.push({
        token: cand.token,
        replacement: `<script type='module'>\n//<![CDATA[\n${combined}\n//]]>\n</script>`,
        isModule: true,
      });
    } else {
      const obfJs = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(rawJs));
      scriptsObfuscated++;
      scriptSlots.push({
        token: cand.token,
        replacement: `<script type='text/javascript'>\n//<![CDATA[\n${obfJs}\n//]]>\n</script>`,
        isModule: false,
      });
    }
  }

  // --- STEP 3: Hide Static HTML Blocks (Header, Footer, Modals, Static Homepage Sections) -> ONE combined UI Mount script ---
  let combinedUiMountXml = '';
  if (settings.hideCssAndHtmlInJs) {
    const bodyMatch = /(<body\b[^>]*>)([\s\S]*?)(<\/body>)/i.exec(working);
    if (bodyMatch) {
      onProgress?.({ stage: 'HTML এনকোড হচ্ছে (১টি সম্মিলিত স্ক্রিপ্ট)...', percent: 70 });
      const mounts: UiMountEntry[] = [];
      const usedIds = new Set<string>();
      const counters = { home: 0, ui: 0 };

      const strippedBody = collectAndStripStaticUiBlocks(
        bodyMatch[2],
        mounts,
        usedIds,
        counters,
        false
      );

      if (mounts.length > 0) {
        htmlHidden = true;
        const pairsJson = JSON.stringify(mounts.map((m) => [m.id, m.html]));
        const mountRunnerJs = `(function(){
  var _m = ${pairsJson};
  function _apply() {
    for (var i = 0; i < _m.length; i++) {
      var el = document.getElementById(_m[i][0]);
      if (el && !el.dataset.cgMounted) {
        el.innerHTML = _m[i][1];
        el.dataset.cgMounted = '1';
      }
    }
  }
  _apply();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _apply);
  }
})();`;
        const obfMount = sanitizeObfuscatedTagBoundaries(await obfuscateSafe(mountRunnerJs));
        combinedUiMountXml = `<script type='text/javascript'>\n//<![CDATA[\n${obfMount}\n//]]>\n</script>`;
        scriptsObfuscated++;
      }

      working =
        working.slice(0, bodyMatch.index) +
        `${bodyMatch[1]}${strippedBody}${bodyMatch[3]}` +
        working.slice(bodyMatch.index + bodyMatch[0].length);
    }
  }

  // Place combined UI mount script right BEFORE the first <script type='module'> token (or before </body>)
  // so every mount target in DOM above module script is hydrated before module script runs!
  if (combinedUiMountXml) {
    const firstModuleSlot = scriptSlots.find((s) => s.isModule && working.includes(s.token));
    if (firstModuleSlot) {
      working = working.replace(firstModuleSlot.token, () => `${combinedUiMountXml}\n${firstModuleSlot.token}`);
    } else if (/<\/body>/i.test(working)) {
      working = working.replace(/<\/body>/i, () => `${combinedUiMountXml}\n</body>`);
    } else {
      working = `${working}\n${combinedUiMountXml}`;
    }
  }

  // Restore obfuscated script tokens back into XML
  for (const slot of scriptSlots) {
    working = working.replace(slot.token, () => slot.replacement);
  }

  // Inject single combined <head> script (Domain Lock + CSS injector) before </head>
  if (headCombinedScriptXml) {
    if (/<\/head>/i.test(working)) {
      working = working.replace(/<\/head>/i, () => `${headCombinedScriptXml}\n</head>`);
    } else {
      working = `${headCombinedScriptXml}\n${working}`;
    }
  }

  // --- STEP 4: Anti-Inspect & Anti-Copy Guard before </body> ---
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

  // --- STEP 5: Mandatory XML Validation via DOMParser ---
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
