import type { ObfuscatorOptions } from 'javascript-obfuscator';
import { CodeFormat, SecuritySettings } from '../types/index.ts';

/**
 * Cleans a single raw domain input (strips http(s)://, paths, ports, spaces).
 */
export function sanitizeDomainToken(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .trim()
    .toLowerCase();
}

/**
 * Parses comma-, space-, semicolon-, or newline-separated domain input into clean hostnames.
 * Automatically adds www.blogger.com when format is 'blogger' and allowBloggerPreview is true.
 */
export function parseDomainList(
  domainInput: string,
  format: CodeFormat,
  allowBloggerPreview: boolean
): string[] {
  const rawList = domainInput
    .split(/[\s,;]+/)
    .map(sanitizeDomainToken)
    .filter((item) => item.length > 0);

  const unique = new Set<string>(rawList);

  if (unique.size > 0 && format === 'blogger' && allowBloggerPreview) {
    unique.add('www.blogger.com');
  }

  return Array.from(unique);
}

/**
 * Builds the exact high-security javascript-obfuscator configuration.
 * CRITICAL safety flags remain FALSE (renameGlobals, renameProperties,
 * transformObjectKeys, deadCodeInjection, debugProtection) so Firebase,
 * window.* functions, inline onclick="..." handlers, and mobile browsers work 100%.
 */
export function buildObfuscatorOptions(
  settings: SecuritySettings,
  domains: string[],
  forPreview: boolean
): ObfuscatorOptions {
  const encodingOption: Array<'rc4' | 'base64'> =
    settings.stringArrayEncoding === 'none'
      ? []
      : [settings.stringArrayEncoding];

  const useDomainLock = !forPreview && domains.length > 0;

  const options: ObfuscatorOptions = {
    compact: true,
    simplify: true,
    target: 'browser',
    identifierNamesGenerator: 'hexadecimal',
    stringArray: true,
    stringArrayThreshold: 1,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayIndexShift: true,
    stringArrayIndexesType: ['hexadecimal-number'],
    stringArrayWrappersCount: 1,
    stringArrayWrappersType: 'variable',
    stringArrayWrappersChainedCalls: true,
    stringArrayEncoding: encodingOption,
    splitStrings: true,
    splitStringsChunkLength: 10,
    numbersToExpressions: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    selfDefending: settings.selfDefending,
    disableConsoleOutput: settings.disableConsoleOutput,
    ignoreImports: true,
    // Mandatory safety exclusions — NEVER enable:
    renameGlobals: false,
    renameProperties: false,
    transformObjectKeys: false,
    deadCodeInjection: false,
    debugProtection: false,
    ...(useDomainLock
      ? {
          domainLock: domains,
          domainLockRedirectUrl: 'about:blank',
        }
      : {}),
  };

  return options;
}

/**
 * Builds a custom hostname check script so unauthorized domains or localhost
 * immediately clear and redirect to about:blank.
 */
export function buildDomainLockGuardScript(domains: string[]): string {
  const serialized = JSON.stringify(domains);
  return `(function(){
  try {
    var allowed = ${serialized};
    var host = (window.location && window.location.hostname ? window.location.hostname : '').toLowerCase();
    var ok = false;
    for (var i = 0; i < allowed.length; i++) {
      var d = allowed[i].toLowerCase();
      if (d.charAt(0) === '.') {
        var bare = d.slice(1);
        if (host === bare || host.slice(-d.length) === d) { ok = true; break; }
      } else if (host === d || host.endsWith('.' + d)) {
        ok = true; break;
      }
    }
    if (!ok) {
      if (document.documentElement) { document.documentElement.innerHTML = ''; }
      window.location.replace('about:blank');
    }
  } catch (e) {}
})();`;
}

/**
 * Builds the Anti-Inspect & Anti-Copy protection script.
 * Blocks Right-Click, F12, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+Shift+I/J/C/K,
 * and copy/selection EXCEPT inside INPUT, TEXTAREA, SELECT, or contenteditable elements
 * so search inputs, login forms, and comment boxes continue working normally.
 */
export function buildAntiInspectScript(): string {
  return `(function(){
  if (typeof document === 'undefined') return;
  function isEditable(el) {
    if (!el) return false;
    var tag = el.tagName ? el.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    if (el.closest && el.closest('input,textarea,select,[contenteditable="true"]')) return true;
    return false;
  }
  try {
    var style = document.createElement('style');
    style.textContent = 'body{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}input,textarea,select,[contenteditable="true"]{-webkit-user-select:text!important;-moz-user-select:text!important;-ms-user-select:text!important;user-select:text!important;}';
    (document.head || document.documentElement).appendChild(style);
  } catch (e) {}
  document.addEventListener('contextmenu', function(e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
    return false;
  }, true);
  document.addEventListener('copy', function(e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
    return false;
  }, true);
  document.addEventListener('cut', function(e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
    return false;
  }, true);
  document.addEventListener('selectstart', function(e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
    return false;
  }, true);
  document.addEventListener('keydown', function(e) {
    var key = (e.key || '').toUpperCase();
    var ctrl = e.ctrlKey || e.metaKey;
    if (e.keyCode === 123 || key === 'F12') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    if (ctrl && e.shiftKey && (key === 'I' || key === 'J' || key === 'C' || key === 'K')) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    if (ctrl && (key === 'U' || key === 'S' || key === 'P')) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    if (ctrl && key === 'C' && !isEditable(e.target)) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
  }, true);
})();`;
}

/**
 * Extracts all top-level ES module `import` statements (including multi-line
 * imports, comments between imports, and side-effect imports) without touching
 * the remaining executable module body.
 */
export function splitModuleImports(code: string): { imports: string; body: string } {
  const len = code.length;
  let i = 0;
  let lastImportEnd = 0;

  const skipWhitespaceAndComments = (pos: number): number => {
    while (pos < len) {
      const ch = code[pos];
      if (/\s/.test(ch)) {
        pos++;
        continue;
      }
      if (ch === '/' && code[pos + 1] === '/') {
        const nl = code.indexOf('\n', pos + 2);
        pos = nl === -1 ? len : nl + 1;
        continue;
      }
      if (ch === '/' && code[pos + 1] === '*') {
        const end = code.indexOf('*/', pos + 2);
        pos = end === -1 ? len : end + 2;
        continue;
      }
      break;
    }
    return pos;
  };

  while (i < len) {
    const start = skipWhitespaceAndComments(i);
    if (start >= len) break;

    // Check if starts with 'import' keyword (not 'import.meta' or 'import(' dynamic import)
    if (code.slice(start, start + 6) === 'import') {
      const afterKw = code[start + 6];
      if (afterKw === ' ' || afterKw === '\t' || afterKw === '\n' || afterKw === '\r' || afterKw === '{' || afterKw === '*' || afterKw === '"' || afterKw === "'") {
        // Scan until end of import statement (respecting strings, comments, and braces)
        let j = start + 6;
        let braceDepth = 0;
        let inSingle = false;
        let inDouble = false;
        let seenFrom = false;
        let seenStringSource = false;

        while (j < len) {
          const ch = code[j];
          if (inSingle) {
            if (ch === '\\') { j += 2; continue; }
            if (ch === "'") { inSingle = false; seenStringSource = true; }
            j++;
            continue;
          }
          if (inDouble) {
            if (ch === '\\') { j += 2; continue; }
            if (ch === '"') { inDouble = false; seenStringSource = true; }
            j++;
            continue;
          }
          if (ch === '/' && code[j + 1] === '/') {
            const nl = code.indexOf('\n', j + 2);
            j = nl === -1 ? len : nl;
            // Newline after string source ends an ASI import statement
            if (seenStringSource && braceDepth === 0) {
              j = nl === -1 ? len : nl + 1;
              break;
            }
            continue;
          }
          if (ch === '/' && code[j + 1] === '*') {
            const end = code.indexOf('*/', j + 2);
            j = end === -1 ? len : end + 2;
            continue;
          }
          if (ch === "'") { inSingle = true; j++; continue; }
          if (ch === '"') { inDouble = true; j++; continue; }
          if (ch === '{') { braceDepth++; j++; continue; }
          if (ch === '}') { braceDepth = Math.max(0, braceDepth - 1); j++; continue; }
          if (braceDepth === 0 && code.slice(j, j + 4) === 'from' && !/[a-zA-Z0-9_$]/.test(code[j - 1] || '') && !/[a-zA-Z0-9_$]/.test(code[j + 4] || '')) {
            seenFrom = true;
            j += 4;
            continue;
          }
          if (ch === ';' && braceDepth === 0) {
            j++;
            break;
          }
          if ((ch === '\n' || ch === '\r') && braceDepth === 0 && (seenStringSource || (!seenFrom && j > start + 6 && /['"]/.test(code.slice(start, j))))) {
            j++;
            break;
          }
          j++;
        }

        lastImportEnd = j;
        i = j;
        continue;
      }
    }

    // Stop as soon as we hit the first non-import statement
    break;
  }

  return {
    imports: code.slice(0, lastImportEnd).trim(),
    body: code.slice(lastImportEnd).trim(),
  };
}

/**
 * Wraps the post-import body of a <script type="module"> inside an async IIFE
 * so top-level variables/constants (like firebaseConfig, ADMIN_EMAIL, local functions)
 * are treated as local scope and fully obfuscated into _0x... identifiers while
 * preserving renameGlobals: false and explicit window.fn = ... exports.
 */
export function wrapModuleBodyForObfuscation(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return '';
  if (/^\s*export\b/m.test(trimmed)) {
    return trimmed;
  }
  return `(async function(){\n${trimmed}\n})();`;
}

/**
 * Ensures obfuscated code never contains raw `]]>` or `</script>` sequences
 * that could prematurely close XML CDATA or HTML <script> tags.
 */
export function sanitizeObfuscatedTagBoundaries(code: string): string {
  return code
    .replace(/\]\]>/g, ']\\x5d>')
    .replace(/<\/script/gi, '<\\x2fscript');
}
