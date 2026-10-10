import beautify from 'js-beautify';
import { CodeFormat, RestoreOptions, RestoreStats } from '../types/index.ts';
import { detectFormat } from './detectFormat.ts';

/**
 * Reverses hex escape sequences (\xHH) into their corresponding UTF-8 characters.
 */
export function deescapeHexStrings(code: string): { result: string; count: number } {
  let count = 0;
  const result = code.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    count++;
    try {
      const codePoint = parseInt(hex, 16);
      // Return printable character
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
 * Detects CodeGaurd self-extracting HTML container and unpacks original source.
 */
export function unpackProtectedHtmlContainer(code: string): { unpacked: string | null } {
  const match = /var\s+_0xdata\s*=\s*["']([A-Za-z0-9+/=]+)["']/i.exec(code);
  if (match && match[1]) {
    try {
      const binary = atob(match[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = new TextDecoder('utf-8').decode(bytes);
      return { unpacked: decoded };
    } catch {
      return { unpacked: null };
    }
  }
  return { unpacked: null };
}

/**
 * Resolves CodeGaurd string array lookups back to inlined string literals.
 */
export function resolveStringArrayTable(code: string): { result: string; count: number } {
  let count = 0;
  // Match: const _0x4e1a = ["...", "..."]; function _0x8f2c(_0xidx){return _0x4e1a[_0xidx];};
  const tableRegex = /const\s+(_0x[a-f0-9]+)\s*=\s*\[([\s\S]*?)\];\s*function\s+(_0x[a-f0-9]+)\s*\([^)]*\)\s*\{[^}]*return\s+\1\[[^\]]+\];?\s*\};?/i;
  const match = tableRegex.exec(code);

  if (match) {
    const rawArrayString = match[2];
    const accessorFunc = match[3];

    try {
      // Parse strings from the array safely without eval
      const stringLiterals: string[] = [];
      const itemRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemRegex.exec(rawArrayString)) !== null) {
        const str = itemMatch[1] !== undefined ? itemMatch[1] : itemMatch[2];
        stringLiterals.push(str);
      }

      if (stringLiterals.length > 0) {
        // Strip the table declaration
        let cleaned = code.replace(match[0], '');

        // Replace all accessor function calls: _0x8f2c(0) -> "string"
        const callRegex = new RegExp(`\\b${accessorFunc}\\s*\\(\\s*(\\d+)\\s*\\)`, 'g');
        cleaned = cleaned.replace(callRegex, (fullCall, idxStr) => {
          const idx = parseInt(idxStr, 10);
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
 * Executes full restore and beautification pipeline.
 */
export function restoreCode(
  inputCode: string,
  format: CodeFormat,
  options: Partial<RestoreOptions> = {}
): { code: string; stats: RestoreStats; notes: string[] } {
  const startTime = performance.now();
  const notes: string[] = [];
  let currentCode = inputCode;
  let decodedCount = 0;

  // 1. Detect target format if auto
  const resolvedFormat = format === 'auto' ? detectFormat(inputCode) : format;

  // 2. Check for CodeGaurd Protected HTML Container
  const containerCheck = unpackProtectedHtmlContainer(currentCode);
  if (containerCheck.unpacked) {
    currentCode = containerCheck.unpacked;
    decodedCount += 1;
    notes.push('Extracted original HTML document from CodeGaurd Protected Container.');
  }

  // 3. Resolve string array tables if enabled
  if (options.resolveStringArrays !== false) {
    const stringArrayResult = resolveStringArrayTable(currentCode);
    if (stringArrayResult.count > 0) {
      currentCode = stringArrayResult.result;
      decodedCount += stringArrayResult.count;
      notes.push(`Resolved ${stringArrayResult.count} string array lookups into inline literals.`);
    }
  }

  // 4. De-escape hex escape sequences if enabled
  if (options.deescapeHex !== false) {
    const hexResult = deescapeHexStrings(currentCode);
    if (hexResult.count > 0) {
      currentCode = hexResult.result;
      decodedCount += hexResult.count;
      notes.push(`Decoded ${hexResult.count} hexadecimal escape sequences (\\xHH).`);
    }
  }

  // 5. De-escape unicode escape sequences if enabled
  if (options.deescapeUnicode !== false) {
    const unicodeResult = deescapeUnicodeStrings(currentCode);
    if (unicodeResult.count > 0) {
      currentCode = unicodeResult.result;
      decodedCount += unicodeResult.count;
      notes.push(`Decoded ${unicodeResult.count} unicode escape sequences (\\uHHHH).`);
    }
  }

  // 6. Beautify / Format based on format
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
    if (resolvedFormat === 'html') {
      formattedCode = beautify.html(currentCode, {
        ...beautifyOptions,
        indent_inner_html: true,
        extra_liners: ['head', 'body', '/html'],
      });
      notes.push('Applied structural HTML tag indentation and nesting.');
    } else if (resolvedFormat === 'css') {
      formattedCode = beautify.css(currentCode, beautifyOptions);
      notes.push('Formatted CSS rulesets, properties, and media queries.');
    } else if (resolvedFormat === 'blogger') {
      // Blogger XML: use XML/HTML beautifier carefully
      formattedCode = beautify.html(currentCode, {
        ...beautifyOptions,
        indent_inner_html: true,
      });
      notes.push('Reformatted Blogger XML structure with preserved namespaces and tags.');
    } else {
      // Default to JS
      formattedCode = beautify.js(currentCode, beautifyOptions);
      notes.push('Formatted JavaScript statements, blocks, and syntax.');
    }
  } catch (err: unknown) {
    notes.push('Notice: Format beautification encountered a syntax irregularity; returned best-effort structure.');
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
