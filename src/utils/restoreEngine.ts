import beautify from 'js-beautify';
import { CodeFormat, RestoreOptions, RestoreStats } from '../types/index.ts';
import { decodeBase64ToUtf8, decodeHexString } from './encodingUtils.ts';
import { restoreBloggerXml } from './bloggerEngine.ts';

/**
 * Reverses hex escape sequences (\xHH) into their corresponding UTF-8 characters.
 */
export function deescapeHexStrings(code: string): { result: string; count: number } {
  let count = 0;
  const result = code.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    count++;
    try {
      const codePoint = parseInt(hex, 16);
      if (codePoint >= 32 && codePoint <= 126 && codePoint !== 34 && codePoint !== 39 && codePoint !== 92) {
        return String.fromCharCode(codePoint);
      }
      return match;
    } catch {
      return match;
    }
  });
  return { result, count };
}

/**
 * Reverses unicode escape sequences (\uHHHH).
 */
export function deescapeUnicodeStrings(code: string): { result: string; count: number } {
  let count = 0;
  const result = code.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    count++;
    try {
      const codePoint = parseInt(hex, 16);
      if (codePoint >= 32 && codePoint <= 126 && codePoint !== 34 && codePoint !== 39 && codePoint !== 92) {
        return String.fromCharCode(codePoint);
      }
      return match;
    } catch {
      return match;
    }
  });
  return { result, count };
}

/**
 * Detects CodeGaurd and common self-executing HTML encoded runners and unpacks the original source.
 */
export function unpackProtectedHtml(code: string): { unpacked: string | null } {
  // 1. Check for standard CodeGaurd HTML runner: var _0xdata = "<base64>";
  const dataMatch = /var\s+_0xdata\s*=\s*["']([A-Za-z0-9+/=]+)["']/i.exec(code);
  if (dataMatch && dataMatch[1]) {
    try {
      const decoded = decodeBase64ToUtf8(dataMatch[1]);
      if (decoded && decoded.trim().length > 0) {
        return { unpacked: decoded };
      }
    } catch {
      // Fallback
    }
  }

  // 2. Check for document.write(decodeURIComponent(escape(window.atob("<base64>"))))
  const writeAtobMatch = /document\.write\s*\(\s*(?:decodeURIComponent\s*\(\s*escape\s*\(\s*(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)\s*\)|(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=]+)["']\s*\))\s*\)/i.exec(code);
  if (writeAtobMatch) {
    const b64 = writeAtobMatch[1] || writeAtobMatch[2];
    if (b64) {
      try {
        const decoded = decodeBase64ToUtf8(b64);
        if (decoded && decoded.trim().length > 0) {
          return { unpacked: decoded };
        }
      } catch {
        // Fallback
      }
    }
  }

  // 3. Check for legacy XOR container: var _0xk = <num>; var _0xp = "<base64>";
  const xorMatch = /var\s+_0xk\s*=\s*(\d+);\s*var\s+_0xp\s*=\s*["']([A-Za-z0-9+/=]+)["']/i.exec(code);
  if (xorMatch && xorMatch[1] && xorMatch[2]) {
    try {
      const xorKey = parseInt(xorMatch[1], 10);
      const binary = atob(xorMatch[2]);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i) ^ ((xorKey + (i % 31)) & 0xff);
      }
      const decoded = new TextDecoder('utf-8').decode(bytes);
      return { unpacked: decoded };
    } catch {
      // Fallback
    }
  }

  return { unpacked: null };
}

/**
 * Detects CodeGaurd and common self-executing JavaScript encoded runners and unpacks original JS.
 */
export function unpackProtectedJs(code: string): { unpacked: string | null } {
  // 1. Check for standard CodeGaurd JS runner: var _0xjs = "<base64>";
  const jsMatch = /var\s+_0xjs\s*=\s*["']([A-Za-z0-9+/=]+)["']/i.exec(code);
  if (jsMatch && jsMatch[1]) {
    try {
      const decoded = decodeBase64ToUtf8(jsMatch[1]);
      if (decoded && decoded.trim().length > 0) {
        return { unpacked: decoded };
      }
    } catch {
      // Fallback
    }
  }

  // 2. Check for eval(decodeURIComponent(escape(window.atob("<base64>")))) or eval(atob("<base64>"))
  const evalAtobMatch = /eval\s*\(\s*(?:decodeURIComponent\s*\(\s*escape\s*\(\s*(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)\s*\)|(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=]+)["']\s*\))\s*\)/i.exec(code);
  if (evalAtobMatch) {
    const b64 = evalAtobMatch[1] || evalAtobMatch[2];
    if (b64) {
      try {
        const decoded = decodeBase64ToUtf8(b64);
        if (decoded && decoded.trim().length > 0) {
          return { unpacked: decoded };
        }
      } catch {
        // Fallback
      }
    }
  }

  return { unpacked: null };
}

/**
 * Resolves CodeGaurd string array lookups back to inlined string literals.
 */
export function resolveStringArrayTable(code: string): { result: string; count: number } {
  let count = 0;
  const tableRegex = /const\s+(_0x[a-f0-9]+)\s*=\s*\[([\s\S]*?)\];\s*function\s+(_0x[a-f0-9]+)\s*\([^)]*\)\s*\{[^}]*return\s+\1\[[^\]]+\];?\s*\};?/i;
  const match = tableRegex.exec(code);

  if (match) {
    const rawArrayString = match[2];
    const accessorFunc = match[3];

    try {
      const stringLiterals: string[] = [];
      const itemRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemRegex.exec(rawArrayString)) !== null) {
        const str = itemMatch[1] !== undefined ? itemMatch[1] : itemMatch[2];
        stringLiterals.push(str);
      }

      if (stringLiterals.length > 0) {
        let cleaned = code.replace(match[0], '');
        const callRegex = new RegExp(`\\b${accessorFunc}\\s*\\(\\s*(0x[0-9a-fA-F]+|\\d+)\\s*\\)`, 'g');
        cleaned = cleaned.replace(callRegex, (fullCall, idxStr) => {
          const idx = idxStr.toLowerCase().startsWith('0x')
            ? parseInt(idxStr, 16)
            : parseInt(idxStr, 10);
          if (idx >= 0 && idx < stringLiterals.length) {
            count++;
            return JSON.stringify(stringLiterals[idx]);
          }
          return fullCall;
        });

        return { result: cleaned.trim(), count };
      }
    } catch {
      // Fallback
    }
  }

  return { result: code, count: 0 };
}

/**
 * Executes full restore and decoding pipeline.
 */
export function restoreCode(
  inputCode: string,
  format: CodeFormat,
  options: Partial<RestoreOptions> = {}
): { code: string; stats: RestoreStats; notes: string[] } {
  const startTime = performance.now();
  const notes: string[] = [];
  let currentCode = inputCode.trim();
  let decodedCount = 0;

  const resolvedFormat = format;

  // 1. Format-specific unpacking
  if (resolvedFormat === 'blogger') {
    // Unpack Blogger XML
    const bloggerResult = restoreBloggerXml(currentCode);
    if (bloggerResult.decodedCount > 0) {
      currentCode = bloggerResult.code;
      decodedCount += bloggerResult.decodedCount;
      notes.push(`Decoded ${bloggerResult.decodedCount} protected scripts inside Blogger XML.`);
    }
  } else {
    // Unpack HTML runner
    const htmlUnpack = unpackProtectedHtml(currentCode);
    if (htmlUnpack.unpacked) {
      currentCode = htmlUnpack.unpacked;
      decodedCount += 1;
      notes.push('Successfully decoded and unpacked protected HTML payload.');
    }
  }

  // Cross-check: If not unpacked yet, attempt general HTML or JS unpack
  if (decodedCount === 0) {
    const htmlCheck = unpackProtectedHtml(currentCode);
    if (htmlCheck.unpacked) {
      currentCode = htmlCheck.unpacked;
      decodedCount += 1;
      notes.push('Detected and decoded encoded HTML container.');
    } else {
      const jsCheck = unpackProtectedJs(currentCode);
      if (jsCheck.unpacked) {
        currentCode = jsCheck.unpacked;
        decodedCount += 1;
        notes.push('Detected and decoded encoded JavaScript payload.');
      }
    }
  }

  // 2. Resolve string array tables if enabled
  if (options.resolveStringArrays !== false) {
    const stringArrayResult = resolveStringArrayTable(currentCode);
    if (stringArrayResult.count > 0) {
      currentCode = stringArrayResult.result;
      decodedCount += stringArrayResult.count;
      notes.push(`Resolved ${stringArrayResult.count} string array lookups into inline literals.`);
    }
  }

  // 3. De-escape hex escape sequences if enabled
  if (options.deescapeHex !== false) {
    const hexResult = deescapeHexStrings(currentCode);
    if (hexResult.count > 0) {
      currentCode = hexResult.result;
      decodedCount += hexResult.count;
      notes.push(`Decoded ${hexResult.count} hexadecimal escape sequences (\\xHH).`);
    }
  }

  // 4. De-escape unicode escape sequences if enabled
  if (options.deescapeUnicode !== false) {
    const unicodeResult = deescapeUnicodeStrings(currentCode);
    if (unicodeResult.count > 0) {
      currentCode = unicodeResult.result;
      decodedCount += unicodeResult.count;
      notes.push(`Decoded ${unicodeResult.count} unicode escape sequences (\\uHHHH).`);
    }
  }

  // 5. Beautify / Format based on target format
  const indentSize = options.indentSize || 2;
  const beautifyOptions = {
    indent_size: indentSize,
    space_in_empty_paren: false,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    wrap_line_length: 100,
    end_with_newline: true,
  };

  let formattedCode = currentCode;
  try {
    if (resolvedFormat === 'blogger') {
      formattedCode = beautify.html(currentCode, {
        ...beautifyOptions,
        indent_inner_html: true,
      });
      notes.push('Formatted Blogger XML structure with preserved namespaces and tags.');
    } else {
      formattedCode = beautify.html(currentCode, {
        ...beautifyOptions,
        indent_inner_html: true,
        extra_liners: ['head', 'body', '/html'],
      });
      notes.push('Formatted HTML structure with clean indentation.');
    }
  } catch (err: unknown) {
    notes.push('Notice: Format beautification completed with best-effort structure.');
  }

  const durationMs = Math.round(performance.now() - startTime);

  return {
    code: formattedCode,
    stats: {
      originalSize: inputCode.length,
      restoredSize: formattedCode.length,
      stringsDecoded: decodedCount,
      formatApplied: resolvedFormat,
      durationMs,
    },
    notes,
  };
}
