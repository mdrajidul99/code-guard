import { ProcessingProgress, SecuritySettings } from '../types/index.ts';
import { minifyCss } from './cssEngine.ts';
import {
  buildAntiIframeScript,
  buildAntiInspectScript,
  buildAntiMirrorAndWebViewScript,
  buildDomainLockGuardScript,
  buildObfuscatorOptions,
  parseDomainList,
  sanitizeObfuscatedTagBoundaries,
  splitModuleImports,
  wrapModuleBodyForObfuscation,
} from './jsHelpers.ts';
import { obfuscateInWorker } from './workerClient.ts';

export interface HtmlProcessResult {
  output: string;
  scriptsObfuscated: number;
  cssHidden: boolean;
  htmlHidden: boolean;
  domainLockActive: boolean;
}

interface ExtractedScript {
  fullMatch: string;
  attrs: string;
  content: string;
  isSelfClosing: boolean;
  isExternal: boolean;
  isNonExecutableData: boolean;
  isModule: boolean;
}

function classifyScript(fullMatch: string, attrs: string, content: string, isSelfClosing: boolean): ExtractedScript {
  const isExternal = /\bsrc\s*=/i.test(attrs);
  const isNonExecutableData = /\btype\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template|text\/x-template|importmap)["']?/i.test(attrs);
  const isModule = /\btype\s*=\s*["']?module["']?/i.test(attrs);
  return {
    fullMatch,
    attrs,
    content,
    isSelfClosing,
    isExternal,
    isNonExecutableData,
    isModule,
  };
}

/**
 * Mode 1: Single HTML (Website & App Code) processing pipeline.
 * - Never uses document.write().
 * - Preserves <meta>, <title>, <link>, external <script src="...">, JSON-LD.
 * - Minifies & hides CSS inside an obfuscated JS style injector in <head> (combined with Domain Lock guard).
 * - Replaces static <body> markup with <div id="cg-app-mount"></div> + obfuscated JS mount.
 * - Preserves <script type="module"> top-level imports (including multi-line) and wraps the body in
 *   (async function(){ ... })(); before obfuscation so top-level variables/functions are fully mangled.
 * - Appends obfuscated Anti-Inspect & Anti-Copy protection before </body>.
 */
export async function processHtmlDocument(
  htmlSource: string,
  settings: SecuritySettings,
  options: {
    forPreview?: boolean;
    onProgress?: (progress: ProcessingProgress) => void;
  } = {}
): Promise<HtmlProcessResult> {
  const trimmed = htmlSource.trim();
  if (!trimmed) {
    throw new Error('Input HTML code is empty.');
  }

  const forPreview = Boolean(options.forPreview);
  const onProgress = options.onProgress;

  const domains = parseDomainList(settings.domainLock, 'html', false);
  const obfOptions = buildObfuscatorOptions(settings, domains, forPreview);
  const domainLockActive = !forPreview && domains.length > 0;
  const hideCssAndHtml = !settings.seoSafeMode && settings.hideCssAndHtmlInJs;

  let working = trimmed;
  let scriptsObfuscated = 0;
  let cssHidden = false;
  let htmlHidden = false;

  // Strip non-essential HTML comments while preserving IE conditional comments (skipped in SEO-Safe Mode)
  if (!settings.seoSafeMode) {
    working = working.replace(/<!--(?!\s*(?:\[if|#))[\s\S]*?-->/g, '');
  }

  const hasHeadTag = /<head\b[^>]*>[\s\S]*?<\/head>/i.test(working);
  const hasBodyTag = /<body\b[^>]*>([\s\S]*?)<\/body>/i.test(working);

  // --- STEP 1 & 2: Domain Lock + Anti-Iframe + Anti-Mirror/WebView + Hide CSS (<style> blocks) in one combined <head> script ---
  const headScriptParts: string[] = [];
  if (domainLockActive) {
    onProgress?.({ stage: 'ডোমেইন লক সুরক্ষা তৈরি হচ্ছে...', percent: 12 });
    headScriptParts.push(buildDomainLockGuardScript(domains));
  }

  if (!forPreview && settings.antiIframe) {
    onProgress?.({ stage: 'Anti-Iframe সুরক্ষা যুক্ত হচ্ছে...', percent: 16 });
    headScriptParts.push(buildAntiIframeScript(domains));
  }

  if (!forPreview && settings.antiMirrorAndWebView) {
    onProgress?.({ stage: 'Anti-Mirror ও WebView গার্ড যুক্ত হচ্ছে...', percent: 20 });
    headScriptParts.push(buildAntiMirrorAndWebViewScript());
  }

  const collectedCssParts: string[] = [];
  if (hideCssAndHtml) {
    onProgress?.({ stage: 'CSS এনকোড হচ্ছে...', percent: 25 });
    working = working.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match, cssInner) => {
      const minified = minifyCss(cssInner);
      if (minified) {
        collectedCssParts.push(minified);
      }
      return '';
    });
  } else if (!settings.seoSafeMode) {
    working = working.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_m, open, cssInner, close) => {
      return `${open}${minifyCss(cssInner)}${close}`;
    });
  }

  if (hideCssAndHtml && collectedCssParts.length > 0) {
    const mergedCss = collectedCssParts.join('\n');
    const cssScript = `(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(mergedCss)};(document.head||document.documentElement).appendChild(s);})();`;
    headScriptParts.push(cssScript);
    cssHidden = true;
  }

  let headCombinedTag = '';
  if (headScriptParts.length > 0) {
    const obfHeadJs = sanitizeObfuscatedTagBoundaries(
      await obfuscateInWorker(headScriptParts.join('\n'), obfOptions)
    );
    headCombinedTag = `<script>${obfHeadJs}</script>`;
    scriptsObfuscated++;
  }

  // Helper to obfuscate a single extracted script
  const processSingleScript = async (item: ExtractedScript): Promise<string> => {
    if (item.isSelfClosing || item.isExternal || item.isNonExecutableData || !item.content.trim()) {
      return item.fullMatch;
    }

    if (item.isModule) {
      const { imports, body } = splitModuleImports(item.content);
      if (!body.trim()) {
        return item.fullMatch;
      }
      const wrappedBody = wrapModuleBodyForObfuscation(body);
      const obfBody = sanitizeObfuscatedTagBoundaries(await obfuscateInWorker(wrappedBody, obfOptions));
      scriptsObfuscated++;
      const combined = imports ? `${imports}\n${obfBody}` : obfBody;
      return `<script${item.attrs}>${combined}</script>`;
    }

    const obfCode = sanitizeObfuscatedTagBoundaries(await obfuscateInWorker(item.content, obfOptions));
    scriptsObfuscated++;
    return `<script${item.attrs}>${obfCode}</script>`;
  };

  // --- STEP 3: Process <head> inline scripts (if full HTML document) ---
  if (hasHeadTag) {
    const headMatch = /(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i.exec(working);
    if (headMatch) {
      let headInner = headMatch[2];
      const headScripts: ExtractedScript[] = [];
      headInner = headInner.replace(
        /<script\b([^>]*)\/\s*>|<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
        (fullMatch, selfAttrs, attrs, content) => {
          const isSelf = selfAttrs !== undefined;
          const idx = headScripts.length;
          headScripts.push(classifyScript(fullMatch, isSelf ? selfAttrs : (attrs || ''), content || '', isSelf));
          return `__CG_HEAD_SCRIPT_${idx}__`;
        }
      );

      if (headScripts.length > 0) {
        onProgress?.({ stage: 'হেড স্ক্রিপ্ট এনকোড হচ্ছে...', percent: 42 });
        for (let i = 0; i < headScripts.length; i++) {
          const processed = await processSingleScript(headScripts[i]);
          headInner = headInner.replace(`__CG_HEAD_SCRIPT_${i}__`, () => processed);
        }
      }

      const updatedHead = `${headMatch[1]}${headInner.trim()}${headCombinedTag ? '\n' + headCombinedTag : ''}\n${headMatch[3]}`;
      working = working.slice(0, headMatch.index) + updatedHead + working.slice(headMatch.index + headMatch[0].length);
    }
  }

  // --- STEP 4: Process <body> (Hide Static HTML + Obfuscate Scripts + Anti-Inspect) ---
  let antiInspectTag = '';
  if (settings.antiInspectAndCopy) {
    onProgress?.({ stage: 'Anti-Inspect ও Anti-Copy সুরক্ষা তৈরি হচ্ছে...', percent: 86 });
    const antiRaw = buildAntiInspectScript();
    const antiObf = sanitizeObfuscatedTagBoundaries(await obfuscateInWorker(antiRaw, obfOptions));
    antiInspectTag = `<script>${antiObf}</script>`;
    scriptsObfuscated++;
  }

  if (hasBodyTag) {
    const bodyMatch = /(<body\b[^>]*>)([\s\S]*?)(<\/body>)/i.exec(working);
    if (bodyMatch) {
      const openBody = bodyMatch[1];
      let bodyInner = bodyMatch[2];
      const closeBody = bodyMatch[3];

      const bodyScripts: ExtractedScript[] = [];
      bodyInner = bodyInner.replace(
        /<script\b([^>]*)\/\s*>|<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
        (fullMatch, selfAttrs, attrs, content) => {
          const isSelf = selfAttrs !== undefined;
          const idx = bodyScripts.length;
          bodyScripts.push(classifyScript(fullMatch, isSelf ? selfAttrs : (attrs || ''), content || '', isSelf));
          return hideCssAndHtml ? '' : `__CG_BODY_SCRIPT_${idx}__`;
        }
      );

      onProgress?.({ stage: 'Scripts এনকোড হচ্ছে...', percent: 68 });
      const processedBodyScripts: string[] = [];
      for (let i = 0; i < bodyScripts.length; i++) {
        processedBodyScripts.push(await processSingleScript(bodyScripts[i]));
      }

      let finalBodyInner = '';
      if (hideCssAndHtml) {
        onProgress?.({ stage: 'HTML এনকোড হচ্ছে...', percent: 55 });
        const cleanStaticHtml = bodyInner.replace(/\s+/g, ' ').trim();
        let htmlMountPart = '';
        if (cleanStaticHtml) {
          const mountJs = `(function(){function _a(){var m=document.getElementById('cg-app-mount');if(m&&!m.dataset.cgMounted){m.innerHTML=${JSON.stringify(cleanStaticHtml)};m.dataset.cgMounted='1';}}_a();if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_a);}})();`;
          const obfMount = sanitizeObfuscatedTagBoundaries(await obfuscateInWorker(mountJs, obfOptions));
          htmlMountPart = `<div id="cg-app-mount"></div>\n<script>${obfMount}</script>`;
          htmlHidden = true;
          scriptsObfuscated++;
        }
        const headFallbackExtras = !hasHeadTag && headCombinedTag ? headCombinedTag : '';
        finalBodyInner = [headFallbackExtras, htmlMountPart, ...processedBodyScripts, antiInspectTag]
          .filter(Boolean)
          .join('\n');
      } else {
        let restoredBody = bodyInner;
        for (let i = 0; i < processedBodyScripts.length; i++) {
          restoredBody = restoredBody.replace(`__CG_BODY_SCRIPT_${i}__`, () => processedBodyScripts[i]);
        }
        const headFallbackExtras = !hasHeadTag && headCombinedTag ? headCombinedTag : '';
        finalBodyInner = [headFallbackExtras, restoredBody.trim(), antiInspectTag].filter(Boolean).join('\n');
      }

      const updatedBody = `${openBody}\n${finalBodyInner}\n${closeBody}`;
      working = working.slice(0, bodyMatch.index) + updatedBody + working.slice(bodyMatch.index + bodyMatch[0].length);
    }
  } else {
    // Fragment / Snippet Mode (no <body> tag)
    const fragmentScripts: ExtractedScript[] = [];
    let fragmentHtml = working.replace(
      /<script\b([^>]*)\/\s*>|<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
      (fullMatch, selfAttrs, attrs, content) => {
        const isSelf = selfAttrs !== undefined;
        const idx = fragmentScripts.length;
        fragmentScripts.push(classifyScript(fullMatch, isSelf ? selfAttrs : (attrs || ''), content || '', isSelf));
        return hideCssAndHtml ? '' : `__CG_FRAG_SCRIPT_${idx}__`;
      }
    );

    onProgress?.({ stage: 'Scripts এনকোড হচ্ছে...', percent: 68 });
    const processedFragScripts: string[] = [];
    for (let i = 0; i < fragmentScripts.length; i++) {
      processedFragScripts.push(await processSingleScript(fragmentScripts[i]));
    }

    if (hideCssAndHtml) {
      onProgress?.({ stage: 'HTML এনকোড হচ্ছে...', percent: 55 });
      const cleanFragmentHtml = fragmentHtml.replace(/\s+/g, ' ').trim();
      let mountPart = '';
      if (cleanFragmentHtml) {
        const mountJs = `(function(){function _a(){var m=document.getElementById('cg-app-mount');if(m&&!m.dataset.cgMounted){m.innerHTML=${JSON.stringify(cleanFragmentHtml)};m.dataset.cgMounted='1';}}_a();if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_a);}})();`;
        const obfMount = sanitizeObfuscatedTagBoundaries(await obfuscateInWorker(mountJs, obfOptions));
        mountPart = `<div id="cg-app-mount"></div>\n<script>${obfMount}</script>`;
        htmlHidden = true;
        scriptsObfuscated++;
      }
      working = [headCombinedTag, mountPart, ...processedFragScripts, antiInspectTag]
        .filter(Boolean)
        .join('\n');
    } else {
      for (let i = 0; i < processedFragScripts.length; i++) {
        fragmentHtml = fragmentHtml.replace(`__CG_FRAG_SCRIPT_${i}__`, () => processedFragScripts[i]);
      }
      working = [headCombinedTag, fragmentHtml.trim(), antiInspectTag]
        .filter(Boolean)
        .join('\n');
    }
  }

  onProgress?.({ stage: 'সম্পন্ন হচ্ছে...', percent: 100 });

  return {
    output: working.trim(),
    scriptsObfuscated,
    cssHidden,
    htmlHidden,
    domainLockActive,
  };
}
