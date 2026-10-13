import { SecureOptions } from '../types/index.ts';

// Standard JS keywords that must NEVER be mangled
const JS_RESERVED_KEYWORDS = new Set([
  'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
  'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final',
  'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
  'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new',
  'null', 'package', 'private', 'protected', 'public', 'return', 'short',
  'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'volatile',
  'while', 'with', 'yield',
  // Globals and DOM APIs
  'window', 'document', 'console', 'Math', 'Date', 'JSON', 'Promise', 'setTimeout',
  'clearTimeout', 'setInterval', 'clearInterval', 'fetch', 'localStorage',
  'sessionStorage', 'addEventListener', 'removeEventListener', 'location',
  'navigator', 'history', 'Array', 'Object', 'String', 'Number', 'Boolean',
  'RegExp', 'Error', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol', 'Proxy',
  'Reflect', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI',
  'decodeURI', 'encodeURIComponent', 'decodeURIComponent', 'btoa', 'atob',
  'Blob', 'FormData', 'URL', 'URLSearchParams', 'Event', 'CustomEvent',
  'HTMLElement', 'Node', 'Element', 'Infinity', 'NaN', 'undefined', 'self',
  'globalThis', 'top', 'parent', 'frames'
]);

/**
 * Encodes ASCII characters in a string to hex escape sequences (\xHH).
 */
export function encodeStringToHex(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 32 && code <= 126 && str[i] !== '\\' && str[i] !== '"' && str[i] !== "'") {
      result += '\\x' + code.toString(16).padStart(2, '0');
    } else if (str[i] === '\\') {
      result += '\\\\';
    } else {
      result += str[i];
    }
  }
  return result;
}

/**
 * Safely removes comments from JavaScript code while respecting strings and regexes.
 */
export function removeJsComments(code: string): string {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inRegex = false;
  let result = '';

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = code[i + 1];

    if (!inSingleQuote && !inDoubleQuote && !inTemplate && !inRegex) {
      // Block comment /* ... */
      if (char === '/' && next === '*') {
        const endIndex = code.indexOf('*/', i + 2);
        if (endIndex !== -1) {
          i = endIndex + 1;
          continue;
        }
      }
      // Line comment // ...
      if (char === '/' && next === '/') {
        const nextNewline = code.indexOf('\n', i + 2);
        if (nextNewline !== -1) {
          i = nextNewline;
          result += '\n';
          continue;
        } else {
          break;
        }
      }

      if (char === "'") inSingleQuote = true;
      else if (char === '"') inDoubleQuote = true;
      else if (char === '`') inTemplate = true;
      else if (char === '/' && i > 0 && /[=(:,;!&|?\[\]{}]\s*$/.test(code.slice(Math.max(0, i - 10), i))) {
        inRegex = true;
      }
      result += char;
    } else {
      result += char;
      if (char === '\\' && i + 1 < code.length) {
        result += code[++i];
        continue;
      }
      if (inSingleQuote && char === "'") inSingleQuote = false;
      else if (inDoubleQuote && char === '"') inDoubleQuote = false;
      else if (inTemplate && char === '`') inTemplate = false;
      else if (inRegex && char === '/') inRegex = false;
    }
  }

  return result;
}

/**
 * Minifies JavaScript code cleanly.
 */
export function minifyJs(code: string, options: Partial<SecureOptions> = {}): string {
  let cleaned = code;

  if (options.jsRemoveComments !== false) {
    cleaned = removeJsComments(cleaned);
  }

  if (options.jsMinifyWhitespace !== false) {
    const lines = cleaned.split('\n');
    const trimmedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
    cleaned = trimmedLines.join('\n');

    cleaned = cleaned.replace(/\s*([=+\-*\/%&|^!<>?:;,{}()\[\]])\s*/g, (match, op) => op);

    const keywords = [
      'const', 'let', 'var', 'return', 'function', 'if', 'else', 'while', 'for',
      'throw', 'new', 'typeof', 'case', 'delete', 'void', 'in', 'of', 'import',
      'export', 'class', 'extends', 'yield', 'await', 'async'
    ];
    for (const kw of keywords) {
      const reg = new RegExp(`\\b${kw}([a-zA-Z0-9_$])`, 'g');
      cleaned = cleaned.replace(reg, `${kw} $1`);
    }

    cleaned = cleaned.replace(/\n+/g, ';').replace(/;{2,}/g, ';');
  }

  return cleaned.trim();
}

/**
 * Applies high-strength polymorphic obfuscation and anti-tamper shielding to JavaScript.
 */
export function obfuscateJs(code: string, options: Partial<SecureOptions> = {}): string {
  try {
    let output = code;

    // 1. Remove comments
    if (options.jsRemoveComments !== false) {
      output = removeJsComments(output);
    }

    // 2. String Array Extraction & Scrambling
    if (options.jsStringArrayRotation !== false) {
      const stringsExtracted: string[] = [];
      const stringMap = new Map<string, number>();

      const stringRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;

      output = output.replace(stringRegex, (match, doubleQuoted, singleQuoted) => {
        const rawContent = doubleQuoted !== undefined ? doubleQuoted : singleQuoted;
        if (!rawContent || rawContent.length === 0) return '""';

        let index = stringMap.get(rawContent);
        if (index === undefined) {
          index = stringsExtracted.length;
          stringsExtracted.push(rawContent);
          stringMap.set(rawContent, index);
        }

        return `_0x8f2c(0x${index.toString(16)})`;
      });

      if (stringsExtracted.length > 0) {
        const tableId = '_0x4e1a';
        const accessorId = '_0x8f2c';

        const encodedStrings = stringsExtracted.map(s => `"${encodeStringToHex(s)}"`);
        const tableDeclaration = `const ${tableId}=[${encodedStrings.join(',')}];function ${accessorId}(_0xi){return ${tableId}[_0xi];};`;
        output = tableDeclaration + '\n' + output;
      }
    } else if (options.jsEncodeStringsHex) {
      const stringRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
      output = output.replace(stringRegex, (match, doubleQuoted, singleQuoted) => {
        const rawContent = doubleQuoted !== undefined ? doubleQuoted : singleQuoted;
        if (!rawContent || rawContent.length === 0) return '""';
        return `"${encodeStringToHex(rawContent)}"`;
      });
    }

    // 3. Identifier Mangling
    if (options.jsMangleIdentifiers !== false) {
      const identifierMap = new Map<string, string>();
      let counter = 0;

      const varDeclRegex = /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      const funcDeclRegex = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g;

      let match: RegExpExecArray | null;
      while ((match = varDeclRegex.exec(output)) !== null) {
        const name = match[2];
        if (!JS_RESERVED_KEYWORDS.has(name) && !identifierMap.has(name) && !name.startsWith('_0x')) {
          identifierMap.set(name, `_0x${(0x21a0 + counter++).toString(16)}`);
        }
      }

      while ((match = funcDeclRegex.exec(output)) !== null) {
        const funcName = match[1];
        if (!JS_RESERVED_KEYWORDS.has(funcName) && !identifierMap.has(funcName) && !funcName.startsWith('_0x')) {
          identifierMap.set(funcName, `_0x${(0x21a0 + counter++).toString(16)}`);
        }
        const params = match[2].split(',').map(p => p.trim());
        for (const p of params) {
          if (p && !JS_RESERVED_KEYWORDS.has(p) && !identifierMap.has(p) && !p.startsWith('_0x')) {
            identifierMap.set(p, `_0x${(0x21a0 + counter++).toString(16)}`);
          }
        }
      }

      identifierMap.forEach((mangled, original) => {
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        output = output.replace(regex, mangled);
      });
    }

    // 4. Convert Numbers to Hex
    if (options.jsConvertNumbersToHex !== false) {
      output = output.replace(/\b(\d+)\b/g, (match, numStr) => {
        const num = parseInt(numStr, 10);
        if (num >= 8 && num < 1000000 && !isNaN(num)) {
          return '0x' + num.toString(16);
        }
        return match;
      });
    }

    // 5. Anti-Tamper & Anti-Inspection Self-Defending Shield Wrapper
    if (options.jsAddTamperProtection !== false) {
      const shieldHeader = `
(function(){
  'use strict';
  // Anti-Debugging Freeze Trap
  setInterval(function(){
    try { (function(){}).constructor("debugger")(); } catch(e){}
  }, 1000);

  // Browser Anti-Right-Click & Anti-DevTools Short-Circuit
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      document.addEventListener('contextmenu', function(e){ e.preventDefault(); return false; }, true);
      document.addEventListener('keydown', function(e){
        var k = (e.key || '').toUpperCase();
        var c = e.ctrlKey || e.metaKey;
        if (e.keyCode === 123 || e.key === 'F12' || (c && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) || (c && (k === 'U' || k === 'S'))) {
          e.preventDefault(); e.stopPropagation(); return false;
        }
      }, true);
    } catch(e){}
    try {
      var _c = ['log', 'debug', 'info', 'warn', 'error', 'dir'];
      for (var i = 0; i < _c.length; i++) {
        if (window.console) window.console[_c[i]] = function(){};
      }
    } catch(e){}
  }
})();
`.trim();
      output = shieldHeader + '\n' + output;
    }

    // 6. Final Minification pass
    if (options.jsMinifyWhitespace !== false) {
      output = minifyJs(output, options);
    }

    return output;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`JavaScript protection failed: ${errorMsg}`);
  }
}
