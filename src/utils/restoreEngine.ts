import beautify from 'js-beautify';
import { CodeFormat, RestoreOptions, RestoreStats } from '../types/index.ts';

/**
 * Reverses hexadecimal escape sequences (\xHH) into readable ASCII characters.
 */
export function deescapeHexStrings(code: string): { result: string; count: number } {
  let count = 0;
  const result = code.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    try {
      const codePoint = parseInt(hex, 16);
      if (codePoint >= 32 && codePoint <= 126 && codePoint !== 34 && codePoint !== 39 && codePoint !== 92) {
        count++;
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
 * Reverses unicode escape sequences (\uHHHH or \u{H...}).
 */
export function deescapeUnicodeStrings(code: string): { result: string; count: number } {
  let count = 0;
  let result = code.replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, hex) => {
    try {
      const cp = parseInt(hex, 16);
      if (cp >= 32 && cp <= 0x10ffff && cp !== 34 && cp !== 39 && cp !== 92) {
        count++;
        return String.fromCodePoint(cp);
      }
      return match;
    } catch {
      return match;
    }
  });

  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    try {
      const codePoint = parseInt(hex, 16);
      if (codePoint >= 32 && codePoint <= 126 && codePoint !== 34 && codePoint !== 39 && codePoint !== 92) {
        count++;
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
 * Safely decodes UTF-8 Base64 string.
 */
function safeBase64Decode(b64: string): string | null {
  try {
    const clean = b64.trim().replace(/\s+/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    try {
      return decodeURIComponent(escape(atob(b64.trim())));
    } catch {
      return null;
    }
  }
}

/**
 * Decodes legacy Base64 wrappers, document.write(unescape(...)), eval(atob(...)),
 * and simple reversible percent-encoded unescape("...") blocks.
 */
export function decodeReversibleWrappers(code: string): { result: string; count: number } {
  let count = 0;
  let output = code;

  // 1. Legacy CodeGuard/CodeGaurd var _0xdata / _0xjs / _0xb base64 wrappers
  const varB64Regex = /var\s+(?:_0xdata|_0xjs|_0xb)\s*=\s*["']([A-Za-z0-9+/=]{16,})["']/g;
  const legacyCheck = varB64Regex.exec(output);
  if (legacyCheck && legacyCheck[1]) {
    const decoded = safeBase64Decode(legacyCheck[1]);
    if (decoded && decoded.trim().length > 0) {
      count++;
      output = decoded;
    }
  }

  // 2. document.write(unescape("...")) or unescape('...')
  output = output.replace(
    /(?:document\.write|eval)\s*\(\s*unescape\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*;?/gi,
    (match, encoded) => {
      try {
        const decoded = unescape(encoded);
        count++;
        return decoded;
      } catch {
        return match;
      }
    }
  );

  // 3. document.write(atob("...")) or eval(atob("..."))
  output = output.replace(
    /(?:document\.write|eval)\s*\(\s*(?:decodeURIComponent\s*\(\s*escape\s*\(\s*)?(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)(?:\s*\)\s*\))?\s*\)\s*;?/gi,
    (match, b64) => {
      const decoded = safeBase64Decode(b64);
      if (decoded) {
        count++;
        return decoded;
      }
      return match;
    }
  );

  // 4. Standalone unescape("...") literals
  output = output.replace(/unescape\s*\(\s*["'](%[0-9a-fA-F]{2}[^"']*)["']\s*\)/g, (match, enc) => {
    try {
      const dec = unescape(enc);
      count++;
      return JSON.stringify(dec);
    } catch {
      return match;
    }
  });

  return { result: output, count };
}

/**
 * Detects whether input uses strong one-way javascript-obfuscator (RC4 / Control Flow Flattening / Self-Defending).
 */
export function detectStrongObfuscation(code: string): boolean {
  return (
    /_0x[a-f0-9]{4,6}/i.test(code) &&
    (/while\s*\(\s*!!\s*\[\s*\]\s*\)/.test(code) ||
      /shift\(\)\)\;/.test(code) ||
      /toString\(\).*search/.test(code) ||
      /fromCharCode/.test(code))
  );
}

/**
 * Executes Restore (reversible Base64/Hex/Unicode/unescape decode) and js-beautify formatting.
 */
export function restoreCode(
  inputCode: string,
  format: CodeFormat | 'javascript' | 'css',
  options: Partial<RestoreOptions> = {}
): { code: string; stats: RestoreStats; notes: string[]; isOneWayObfuscated: boolean } {
  const startTime = performance.now();
  const notes: string[] = [];
  let currentCode = inputCode.trim();
  let itemsDecoded = 0;

  const isOneWayObfuscated = detectStrongObfuscation(currentCode);

  if (!options.beautifyOnly) {
    // 1. Decode reversible Base64 / unescape wrappers
    if (options.decodeBase64AndUnescape !== false) {
      const wrapRes = decodeReversibleWrappers(currentCode);
      if (wrapRes.count > 0) {
        currentCode = wrapRes.result;
        itemsDecoded += wrapRes.count;
        notes.push(`Decoded ${wrapRes.count} Base64 / unescape wrapper(s).`);
      }
    }

    // 2. Decode Hex Escapes (\xHH)
    if (options.deescapeHex !== false) {
      const hexRes = deescapeHexStrings(currentCode);
      if (hexRes.count > 0) {
        currentCode = hexRes.result;
        itemsDecoded += hexRes.count;
        notes.push(`Decoded ${hexRes.count} hexadecimal escape sequence(s) (\\xHH).`);
      }
    }

    // 3. Decode Unicode Escapes (\uHHHH)
    if (options.deescapeUnicode !== false) {
      const uniRes = deescapeUnicodeStrings(currentCode);
      if (uniRes.count > 0) {
        currentCode = uniRes.result;
        itemsDecoded += uniRes.count;
        notes.push(`Decoded ${uniRes.count} unicode escape sequence(s) (\\uHHHH).`);
      }
    }
  }

  // 4. Format with js-beautify
  const indentSize = options.indentSize || 2;
  const beautifyOptions = {
    indent_size: indentSize,
    space_in_empty_paren: false,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    wrap_line_length: 120,
    end_with_newline: true,
  };

  let formattedCode = currentCode;
  try {
    if (format === 'javascript') {
      formattedCode = beautify.js(currentCode, beautifyOptions);
      notes.push('Formatted JavaScript using js-beautify.');
    } else if (format === 'css') {
      formattedCode = beautify.css(currentCode, beautifyOptions);
      notes.push('Formatted CSS using js-beautify.');
    } else if (format === 'blogger') {
      formattedCode = beautify.html(currentCode, {
        ...beautifyOptions,
        indent_inner_html: true,
      });
      notes.push('Formatted Blogger XML structure using js-beautify.');
    } else {
      formattedCode = beautify.html(currentCode, {
        ...beautifyOptions,
        indent_inner_html: true,
        extra_liners: ['head', 'body', '/html'],
      });
      notes.push('Formatted HTML structure using js-beautify.');
    }
  } catch {
    notes.push('Formatting completed with best-effort preservation.');
  }

  if (isOneWayObfuscated && !options.beautifyOnly && itemsDecoded === 0) {
    notes.push('Notice: Strong RC4 / Control Flow Flattening / Self-Defending code detected (one-way protected). Formatted with js-beautify only.');
  }

  const durationMs = Math.round(performance.now() - startTime);

  return {
    code: formattedCode,
    stats: {
      originalSize: inputCode.length,
      restoredSize: formattedCode.length,
      itemsDecoded,
      formatApplied: format,
      durationMs,
    },
    notes,
    isOneWayObfuscated,
  };
}
