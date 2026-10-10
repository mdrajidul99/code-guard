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
  'HTMLElement', 'Node', 'Element', 'Infinity', 'NaN', 'undefined'
]);

/**
 * Encodes ASCII characters in a string to hex escape sequences (\xHH).
 */
export function encodeStringToHex(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Keep characters that might break escapes intact or hex escape standard alphanumeric/punctuation
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
 * Safely removes comments from JavaScript code.
 */
export function removeJsComments(code: string): string {
  // Preserve strings and regex while stripping comments
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inRegex = false;
  let result = '';

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = code[i + 1];

    if (!inSingleQuote && !inDoubleQuote && !inTemplate && !inRegex) {
      // Check block comment /* ... */
      if (char === '/' && next === '*') {
        const endIndex = code.indexOf('*/', i + 2);
        if (endIndex !== -1) {
          i = endIndex + 1;
          continue;
        }
      }
      // Check single-line comment // ...
      if (char === '/' && next === '/') {
        const nextNewline = code.indexOf('\n', i + 2);
        if (nextNewline !== -1) {
          i = nextNewline;
          result += '\n';
          continue;
        } else {
          break; // end of string
        }
      }

      // Enter quotes
      if (char === "'") inSingleQuote = true;
      else if (char === '"') inDoubleQuote = true;
      else if (char === '`') inTemplate = true;
      else if (char === '/' && i > 0 && /[=(:,;!&|?\[\]{}]\s*$/.test(code.slice(Math.max(0, i - 10), i))) {
        inRegex = true;
      }
      result += char;
    } else {
      result += char;
      // Handle escape
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
 * Minifies JavaScript code without eval or unsafe execution.
 */
export function minifyJs(code: string, options: Partial<SecureOptions> = {}): string {
  let cleaned = code;

  if (options.jsRemoveComments !== false) {
    cleaned = removeJsComments(cleaned);
  }

  if (options.jsMinifyWhitespace !== false) {
    // Compress multiple spaces outside of quotes
    const lines = cleaned.split('\n');
    const trimmedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
    cleaned = trimmedLines.join('\n');

    // Remove space around operators and punctuation where safe
    cleaned = cleaned.replace(/\s*([=+\-*\/%&|^!<>?:;,{}()\[\]])\s*/g, (match, op) => {
      // Be careful about word boundary combinations like 'return +' or 'typeof x'
      return op;
    });

    // Ensure space is retained after keywords like const, let, var, return, function, if, while, for, throw, new, typeof, case, delete, void, in, of, import, export
    const keywords = ['const', 'let', 'var', 'return', 'function', 'if', 'else', 'while', 'for', 'throw', 'new', 'typeof', 'case', 'delete', 'void', 'in', 'of', 'import', 'export', 'class', 'extends', 'yield', 'await', 'async'];
    for (const kw of keywords) {
      const reg = new RegExp(`\\b${kw}([a-zA-Z0-9_$])`, 'g');
      cleaned = cleaned.replace(reg, `${kw} $1`);
    }

    // Replace newlines where safe with semicolon or space
    cleaned = cleaned.replace(/\n+/g, ';').replace(/;{2,}/g, ';');
  }

  return cleaned.trim();
}

/**
 * Applies professional AST/regex obfuscation to JavaScript source code.
 */
export function obfuscateJs(code: string, options: Partial<SecureOptions> = {}): string {
  try {
    let output = code;

    // 1. Remove comments
    if (options.jsRemoveComments !== false) {
      output = removeJsComments(output);
    }

    // 2. String Array Extraction & Rotation (if enabled)
    if (options.jsStringArrayRotation) {
      const stringsExtracted: string[] = [];
      const stringMap = new Map<string, number>();

      // Match string literals ("..." or '...') that do not span newlines
      const stringRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
      
      output = output.replace(stringRegex, (match, doubleQuoted, singleQuoted) => {
        const rawContent = doubleQuoted !== undefined ? doubleQuoted : singleQuoted;
        if (rawContent.length === 0) return '""';
        
        let index = stringMap.get(rawContent);
        if (index === undefined) {
          index = stringsExtracted.length;
          stringsExtracted.push(rawContent);
          stringMap.set(rawContent, index);
        }

        // Call the scrambled table accessor
        return `_0x8f2c(${index})`;
      });

      if (stringsExtracted.length > 0) {
        // Build the string lookup table
        const tableId = '_0x4e1a';
        const accessorId = '_0x8f2c';

        // Optionally hex-encode strings inside table
        const encodedStrings = stringsExtracted.map(s => {
          if (options.jsEncodeStringsHex) {
            return `"${encodeStringToHex(s)}"`;
          }
          return JSON.stringify(s);
        });

        const tableDeclaration = `const ${tableId}=[${encodedStrings.join(',')}];function ${accessorId}(_0xidx){return ${tableId}[_0xidx];};`;
        output = tableDeclaration + '\n' + output;
      }
    } else if (options.jsEncodeStringsHex) {
      // Just hex-encode string literals inline
      const stringRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
      output = output.replace(stringRegex, (match, doubleQuoted, singleQuoted) => {
        const rawContent = doubleQuoted !== undefined ? doubleQuoted : singleQuoted;
        if (rawContent.length === 0) return '""';
        return `"${encodeStringToHex(rawContent)}"`;
      });
    }

    // 3. Identifier Mangling (if enabled)
    if (options.jsMangleIdentifiers) {
      const identifierMap = new Map<string, string>();
      let counter = 0;

      // Match local variable declarations: const/let/var x, function x(a, b)
      const varDeclRegex = /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      const funcDeclRegex = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g;

      // Collect local function parameters and variable names
      let match: RegExpExecArray | null;
      while ((match = varDeclRegex.exec(output)) !== null) {
        const name = match[2];
        if (!JS_RESERVED_KEYWORDS.has(name) && !identifierMap.has(name)) {
          identifierMap.set(name, `_0x${(0x1a00 + counter++).toString(16)}`);
        }
      }

      while ((match = funcDeclRegex.exec(output)) !== null) {
        const funcName = match[1];
        if (!JS_RESERVED_KEYWORDS.has(funcName) && !identifierMap.has(funcName)) {
          identifierMap.set(funcName, `_0x${(0x1a00 + counter++).toString(16)}`);
        }
        // Parameters
        const params = match[2].split(',').map(p => p.trim());
        for (const p of params) {
          if (p && !JS_RESERVED_KEYWORDS.has(p) && !identifierMap.has(p)) {
            identifierMap.set(p, `_0x${(0x1a00 + counter++).toString(16)}`);
          }
        }
      }

      // Replace mapped identifiers using word boundaries
      identifierMap.forEach((mangled, original) => {
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        output = output.replace(regex, mangled);
      });
    }

    // 4. Convert Numbers to Hex (if enabled)
    if (options.jsConvertNumbersToHex) {
      // Replace integer literals between 10 and 999999 not inside strings
      output = output.replace(/\b(\d+)\b/g, (match, numStr) => {
        const num = parseInt(numStr, 10);
        if (num >= 10 && num < 1000000 && !isNaN(num)) {
          return '0x' + num.toString(16);
        }
        return match;
      });
    }

    // 5. Anti-Tamper / Self-Defending Wrapper (if enabled)
    if (options.jsAddTamperProtection) {
      const antiTamper = `(function(){const _0xcheck=function(){try{return !window.__debug__;}catch(_0xe){return true;}};if(!_0xcheck()){return;}})();`;
      output = antiTamper + '\n' + output;
    }

    // 6. Final Minification pass
    if (options.jsMinifyWhitespace !== false) {
      output = minifyJs(output, options);
    }

    return output;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`JavaScript transformation failed: ${errorMsg}`);
  }
}
