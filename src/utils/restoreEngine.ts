import beautify from 'js-beautify';
import { CodeFormat, RestoreOptions, RestoreResult } from '../types/index.ts';
import { validateBloggerXml } from './bloggerEngine.ts';
import { findVaultMatch } from './vaultStorage.ts';
import { runRestoreSandboxWorker } from './restoreSandboxClient.ts';

type TargetFormat = CodeFormat | 'javascript' | 'css';

const MAX_DECODE_PASSES = 12;

const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safely decodes a Base64 string using UTF-8 TextDecoder so Bengali & emojis stay intact.
 */
function safeBase64Decode(b64: string): string | null {
  try {
    const clean = b64.trim().replace(/\s+/g, '');
    if (clean.length < 4 || !/^[A-Za-z0-9+/=]+$/.test(clean)) return null;
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (!decoded) return null;
    // Reject binary garbage with excessive replacement characters
    const replacementCount = (decoded.match(/\uFFFD/g) || []).length;
    if (replacementCount > Math.max(2, decoded.length * 0.08)) return null;
    return decoded;
  } catch {
    try {
      return decodeURIComponent(escape(atob(b64.trim())));
    } catch {
      return null;
    }
  }
}

/**
 * Checks whether decoded text looks like readable markup/code rather than random binary bytes.
 */
function isPlausibleDecodedText(text: string): boolean {
  if (!text || text.length < 4) return false;
  let printable = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 32 && code <= 126) ||
      code >= 0x0980 // Bengali & Unicode scripts / symbols
    ) {
      printable++;
    }
  }
  return printable / text.length >= 0.88;
}

/**
 * Parses a JS string literal delimited by ' or " cleanly without eval().
 */
function unescapeJsQuotedString(rawInner: string, quoteChar: string): string {
  let out = '';
  for (let i = 0; i < rawInner.length; i++) {
    const ch = rawInner[i];
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    i++;
    if (i >= rawInner.length) break;
    const next = rawInner[i];
    switch (next) {
      case 'n': out += '\n'; break;
      case 'r': out += '\r'; break;
      case 't': out += '\t'; break;
      case 'b': out += '\b'; break;
      case 'f': out += '\f'; break;
      case '\\': out += '\\'; break;
      case "'": out += "'"; break;
      case '"': out += '"'; break;
      case 'x': {
        const hex = rawInner.slice(i + 1, i + 3);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          out += String.fromCharCode(parseInt(hex, 16));
          i += 2;
        } else {
          out += 'x';
        }
        break;
      }
      case 'u': {
        if (rawInner[i + 1] === '{') {
          const endBrace = rawInner.indexOf('}', i + 2);
          const hex = endBrace !== -1 ? rawInner.slice(i + 2, endBrace) : '';
          if (/^[0-9a-fA-F]+$/.test(hex)) {
            const cp = parseInt(hex, 16);
            if (cp <= 0x10ffff) {
              out += String.fromCodePoint(cp);
              i = endBrace;
              break;
            }
          }
        }
        const hex4 = rawInner.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex4)) {
          out += String.fromCharCode(parseInt(hex4, 16));
          i += 4;
        } else {
          out += 'u';
        }
        break;
      }
      default:
        out += next === quoteChar ? quoteChar : next;
    }
  }
  return out;
}

/**
 * Safely unpacks Dean Edwards Packer `eval(function(p,a,c,k,e,d){...}(...))` without eval().
 */
function unpackDeanEdwards(code: string): { result: string; count: number } {
  let count = 0;
  const packerRegex =
    /(?:eval\s*\(\s*)?function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*[rd]\s*\)\s*\{[\s\S]*?\}\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(['"])((?:\\.|(?!\5)[\s\S])*)\5\s*\.split\s*\(\s*(['"])\|\7\s*\)(?:\s*,\s*0\s*,\s*\{\s*\})?\s*\)(?:\s*\))?\s*;?/g;

  const result = code.replace(packerRegex, (fullMatch, pQuote, pRaw, aStr, cStr, kQuote, kRaw) => {
    try {
      const a = parseInt(aStr, 10);
      let c = parseInt(cStr, 10);
      if (Number.isNaN(a) || Number.isNaN(c) || a < 2 || a > 62) {
        return fullMatch;
      }

      const p = unescapeJsQuotedString(pRaw, pQuote);
      const k = unescapeJsQuotedString(kRaw, kQuote).split('|');

      const encodeRadix = (num: number): string => {
        const prefix = num < a ? '' : encodeRadix(Math.floor(num / a));
        const rem = num % a;
        const digit = rem > 35 ? String.fromCharCode(rem + 29) : rem.toString(36);
        return prefix + digit;
      };

      const dict: Record<string, string> = {};
      while (c--) {
        const key = encodeRadix(c);
        dict[key] = k[c] || key;
      }

      const unpacked = p.replace(/\b\w+\b/g, (word) =>
        Object.prototype.hasOwnProperty.call(dict, word) ? dict[word] : word
      );

      if (unpacked && unpacked !== fullMatch) {
        count++;
        return unpacked;
      }
      return fullMatch;
    } catch {
      return fullMatch;
    }
  });

  return { result, count };
}

/**
 * Decodes String.fromCharCode(...) and String.fromCodePoint(...) calls into readable strings.
 */
function decodeFromCharCode(code: string): { result: string; count: number } {
  let count = 0;

  // First unwrap document.write / eval wrapping String.fromCharCode directly
  let out = code.replace(
    /(?:document\.writeln?|eval)\s*\(\s*String\.from(?:CharCode|CodePoint)\s*\(\s*([0-9a-fA-Fx,\s]+)\s*\)\s*\)\s*;?/gi,
    (match, argsStr) => {
      const text = parseCharCodeArgs(argsStr);
      if (text !== null) {
        count++;
        return text;
      }
      return match;
    }
  );

  // Then unwrap standalone String.fromCharCode(...) expressions inside JS
  out = out.replace(
    /String\.from(?:CharCode|CodePoint)\s*\(\s*([0-9a-fA-Fx,\s]+)\s*\)/gi,
    (match, argsStr) => {
      const text = parseCharCodeArgs(argsStr);
      if (text !== null) {
        count++;
        return JSON.stringify(text);
      }
      return match;
    }
  );

  return { result: out, count };
}

function parseCharCodeArgs(argsStr: string): string | null {
  const parts = argsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const cps: number[] = [];
  for (const part of parts) {
    if (!/^(?:0x[0-9a-fA-F]+|\d+)$/.test(part)) return null;
    const val = part.toLowerCase().startsWith('0x') ? parseInt(part, 16) : parseInt(part, 10);
    if (Number.isNaN(val) || val < 0 || val > 0x10ffff) return null;
    if (val !== 9 && val !== 10 && val !== 13 && val < 32) return null;
    cps.push(val);
  }
  try {
    return String.fromCodePoint(...cps);
  } catch {
    return null;
  }
}

/**
 * Decodes HTML entity-encoded markup (&lt;html&gt;...&lt;/html&gt;) only when input
 * is genuinely entity-encoded rather than literal normal HTML.
 */
function decodeEntityEncodedHtml(code: string): { result: string; count: number } {
  const looksEntityEncoded =
    /&lt;(?:!DOCTYPE|html|head|body|div|section|header|footer|script|style|b:|p\b|h[1-6]\b)/i.test(code) &&
    !/(?:<!DOCTYPE|<html|<head|<body|<b:skin)/i.test(code);

  if (!looksEntityEncoded) {
    return { result: code, count: 0 };
  }

  let count = 0;
  const decoded = code
    .replace(/&lt;/gi, () => { count++; return '<'; })
    .replace(/&gt;/gi, () => { count++; return '>'; })
    .replace(/&quot;/gi, () => { count++; return '"'; })
    .replace(/&#0*39;|&apos;/gi, () => { count++; return "'"; })
    .replace(/&#x([0-9a-fA-F]+);/gi, (m, hex) => {
      const cp = parseInt(hex, 16);
      if (cp >= 9 && cp <= 0x10ffff) {
        count++;
        return String.fromCodePoint(cp);
      }
      return m;
    })
    .replace(/&#(\d+);/g, (m, dec) => {
      const cp = parseInt(dec, 10);
      if (cp >= 9 && cp <= 0x10ffff) {
        count++;
        return String.fromCodePoint(cp);
      }
      return m;
    })
    .replace(/&amp;/gi, () => { count++; return '&'; });

  return { result: decoded, count };
}

/**
 * Safely resolves simple non-RC4 `_0x` string array + optional rotation IIFE + lookup calls.
 */
function decodeSimpleStringArray(code: string): { result: string; count: number } {
  const arrMatch = /(?:var|let|const)\s+(_0x[a-fA-F0-9]+)\s*=\s*\[([\s\S]{10,12000}?)\]\s*;/.exec(code);
  if (!arrMatch) return { result: code, count: 0 };

  const arrName = arrMatch[1];
  const rawItems: string[] = [];
  const itemRegex = /(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*(?:,|$)/g;
  let m: RegExpExecArray | null;
  let matchedChars = 0;
  while ((m = itemRegex.exec(arrMatch[2])) !== null) {
    rawItems.push(unescapeJsQuotedString(m[2], m[1]));
    matchedChars += m[0].length;
  }

  if (rawItems.length < 2 || matchedChars < arrMatch[2].trim().length * 0.7) {
    return { result: code, count: 0 };
  }

  // Skip RC4 / complex obfuscated wrappers if self-decoding RC4 helper is detected
  if (/fromCharCode[\s\S]{0,400}charCodeAt[\s\S]{0,400}256/.test(code)) {
    return { result: code, count: 0 };
  }

  const workingItems = [...rawItems];
  let out = code;
  let count = 0;

  // Detect optional simple array rotation IIFE: both `})(_0xarr, 0x5)` and `}(_0xarr, 0x5))`
  const rotateRegex = new RegExp(
    `\\(\\s*function\\s*\\([^)]*\\)\\s*\\{[\\s\\S]{0,500}?shift[\\s\\S]{0,200}?\\}\\s*\\)?\\s*\\(\\s*${escapeRegex(arrName)}\\s*,\\s*(0x[0-9a-fA-F]+|\\d+)\\s*\\)\\s*\\)?\\s*;?`
  );
  const rotMatch = rotateRegex.exec(out);
  if (rotMatch) {
    const rotCount = rotMatch[1].startsWith('0x') ? parseInt(rotMatch[1], 16) : parseInt(rotMatch[1], 10);
    if (!Number.isNaN(rotCount) && rotCount > 0 && rotCount < 10000) {
      const steps = rotCount % workingItems.length;
      for (let s = 0; s < steps; s++) {
        const shifted = workingItems.shift();
        if (shifted !== undefined) workingItems.push(shifted);
      }
      out = out.replace(rotMatch[0], '');
      count++;
    }
  }

  // Check simple direct array indexing: _0xarr[0x0] or _0xarr[0]
  const directIdxRegex = new RegExp(`${escapeRegex(arrName)}\\[\\s*(0x[0-9a-fA-F]+|\\d+)\\s*\\]`, 'g');
  out = out.replace(directIdxRegex, (match, idxStr) => {
    const idx = idxStr.startsWith('0x') ? parseInt(idxStr, 16) : parseInt(idxStr, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < workingItems.length) {
      count++;
      return JSON.stringify(workingItems[idx]);
    }
    return match;
  });

  // Detect simple lookup function: `var _0xfn = function(k){...}` or `function _0xfn(k){...}`
  const lookupFnRegex = new RegExp(
    `(?:(?:var|let|const)\\s+(_0x[a-fA-F0-9]+)\\s*=\\s*function|function\\s+(_0x[a-fA-F0-9]+))\\s*\\(\\s*([a-zA-Z_$][\\w$]*)[^)]*\\)\\s*\\{\\s*(?:\\3\\s*=\\s*\\3\\s*-\\s*(0x[0-9a-fA-F]+|\\d+)\\s*;)?[\\s\\S]{0,100}?return\\s+${escapeRegex(arrName)}\\[\\s*\\3\\s*\\]\\s*;?\\s*\\}\\s*;?`
  );
  const fnMatch = lookupFnRegex.exec(out);
  if (fnMatch) {
    const fnName = fnMatch[1] || fnMatch[2];
    const offset = fnMatch[4]
      ? (fnMatch[4].startsWith('0x') ? parseInt(fnMatch[4], 16) : parseInt(fnMatch[4], 10))
      : 0;

    const callRegex = new RegExp(
      `\\b${escapeRegex(fnName)}\\s*\\(\\s*(?:0x([0-9a-fA-F]+)|(\\d+)|['"](0x[0-9a-fA-F]+|\\d+)['"])\\s*\\)`,
      'g'
    );
    out = out.replace(callRegex, (match, hexA, decB, quotedC) => {
      const raw = hexA ? `0x${hexA}` : decB || quotedC || '';
      const rawIdx = raw.startsWith('0x') ? parseInt(raw, 16) : parseInt(raw, 10);
      const actualIdx = rawIdx - offset;
      if (!Number.isNaN(actualIdx) && actualIdx >= 0 && actualIdx < workingItems.length) {
        count++;
        return JSON.stringify(workingItems[actualIdx]);
      }
      return match;
    });
  }

  return { result: out, count };
}

/**
 * Decodes legacy wrappers, document.write, unescape, decodeURIComponent, atob, and standalone Base64.
 */
function decodeWrappersAndBase64(code: string): { result: string; count: number } {
  let count = 0;
  let output = code;

  // 1. Legacy var _0xdata / _0xjs / _0xb = "BASE64"; followed by document.write / eval(atob(_0xdata))
  const varB64Regex =
    /(?:var|let|const)\s+(_0xdata|_0xjs|_0xb)\s*=\s*["']([A-Za-z0-9+/=]{16,})["']\s*;?/g;
  let legacyMatch: RegExpExecArray | null;
  if ((legacyMatch = varB64Regex.exec(output)) !== null) {
    const varName = legacyMatch[1];
    const decoded = safeBase64Decode(legacyMatch[2]);
    const usesVar = new RegExp(`(?:document\\.writeln?|eval)\\s*\\([^)]*\\b${escapeRegex(varName)}\\b`).test(output);
    if (decoded && isPlausibleDecodedText(decoded) && usesVar) {
      count++;
      output = decoded;
    }
  }

  // 2. document.write/eval wrapping unescape("...") / decodeURIComponent("...") / decodeURI("...")
  output = output.replace(
    /(?:document\.writeln?|eval)\s*\(\s*(unescape|decodeURIComponent|decodeURI)\s*\(\s*(['"])((?:\\.|(?!\2)[\s\S])*)\2\s*\)\s*\)\s*;?/gi,
    (match, fnName, q, enc) => {
      try {
        const unesc = unescapeJsQuotedString(enc, q);
        const decoded =
          fnName.toLowerCase() === 'unescape'
            ? unescape(unesc)
            : fnName.toLowerCase() === 'decodeuri'
              ? decodeURI(unesc)
              : decodeURIComponent(unesc);
        count++;
        return decoded;
      } catch {
        return match;
      }
    }
  );

  // 3. document.write/eval wrapping atob("...") or decodeURIComponent(escape(atob("...")))
  output = output.replace(
    /(?:document\.writeln?|eval)\s*\(\s*(?:decodeURIComponent\s*\(\s*escape\s*\(\s*)?(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=\s]+)["']\s*\)(?:\s*\)\s*\))?\s*\)\s*;?/gi,
    (match, b64) => {
      const decoded = safeBase64Decode(b64);
      if (decoded && isPlausibleDecodedText(decoded)) {
        count++;
        return decoded;
      }
      return match;
    }
  );

  // 4. document.write("literal string") / document.writeln("literal string") when literal contains HTML markup
  output = output.replace(
    /document\.writeln?\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*\)\s*;?/gi,
    (match, q, inner) => {
      const decoded = unescapeJsQuotedString(inner, q);
      if (/<[a-zA-Z][\s\S]*>/.test(decoded)) {
        count++;
        return decoded;
      }
      return match;
    }
  );

  // 5. Inline unescape("%..") / decodeURIComponent("%..")
  output = output.replace(
    /(unescape|decodeURIComponent|decodeURI)\s*\(\s*(['"])(%[0-9a-fA-F]{2}(?:\\.|(?!\2)[\s\S])*)\2\s*\)/g,
    (match, fnName, q, enc) => {
      try {
        const raw = unescapeJsQuotedString(enc, q);
        const dec =
          fnName === 'unescape'
            ? unescape(raw)
            : fnName === 'decodeURI'
              ? decodeURI(raw)
              : decodeURIComponent(raw);
        count++;
        return JSON.stringify(dec);
      } catch {
        return match;
      }
    }
  );

  // 6. Inline atob("...") literals
  output = output.replace(
    /(?:window\.)?atob\s*\(\s*["']([A-Za-z0-9+/=\s]{8,})["']\s*\)/g,
    (match, b64) => {
      const dec = safeBase64Decode(b64);
      if (dec && isPlausibleDecodedText(dec)) {
        count++;
        return JSON.stringify(dec);
      }
      return match;
    }
  );

  // 7. Standalone pure Base64 payload pasted directly
  const compact = output.trim().replace(/\s+/g, '');
  if (
    compact.length >= 16 &&
    compact.length % 4 === 0 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(compact) &&
    !/[<>]/.test(output)
  ) {
    const dec = safeBase64Decode(compact);
    if (dec && isPlausibleDecodedText(dec) && /[<>{};:=()]/.test(dec)) {
      count++;
      output = dec;
    }
  }

  return { result: output, count };
}

/**
 * Safely reverses printable hexadecimal (\xHH) escapes without breaking quotes or escaping.
 */
export function deescapeHexStrings(code: string): { result: string; count: number } {
  let count = 0;
  const result = code.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    try {
      const codePoint = parseInt(hex, 16);
      if (
        codePoint >= 32 &&
        codePoint <= 126 &&
        codePoint !== 34 &&
        codePoint !== 39 &&
        codePoint !== 92
      ) {
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
 * Safely reverses printable unicode (\uHHHH and \u{H...}) escapes.
 */
export function deescapeUnicodeStrings(code: string): { result: string; count: number } {
  let count = 0;
  let result = code.replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, hex) => {
    try {
      const cp = parseInt(hex, 16);
      if (
        cp >= 32 &&
        cp <= 0x10ffff &&
        cp !== 34 &&
        cp !== 39 &&
        cp !== 92
      ) {
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
      if (
        codePoint >= 32 &&
        codePoint <= 0xffff &&
        !(codePoint >= 0xd800 && codePoint <= 0xdfff) &&
        codePoint !== 34 &&
        codePoint !== 39 &&
        codePoint !== 92 &&
        codePoint !== 127
      ) {
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
 * Detects whether input uses strong non-reversible locking / obfuscation.
 */
export function detectStrongObfuscation(code: string): boolean {
  return (
    /_0x[a-f0-9]{4,6}/i.test(code) &&
    (/while\s*\(\s*!!\s*\[\s*\]\s*\)/.test(code) ||
      /\(\(\(\.\+\)\+\)\+\)\+\$/.test(code) ||
      /fromCharCode[\s\S]{0,400}charCodeAt[\s\S]{0,400}256/.test(code))
  );
}

/**
 * Checks if a <script> block should NEVER be executed in the restore sandbox worker.
 */
function shouldSkipSandboxScript(attrs: string, content: string): boolean {
  if (/\bsrc\s*=/i.test(attrs)) return true;
  if (
    /\btype\s*=\s*["']?(?:module|application\/(?:ld\+)?json|text\/template|text\/x-template|importmap)["']?/i.test(
      attrs
    )
  ) {
    return true;
  }
  const combined = attrs + '\n' + content;
  if (
    /googlesyndication\.com|googletagmanager\.com|google-analytics\.com|\badsbygoogle\b|<b:|<\/b:|<data:|<expr:/i.test(
      combined
    )
  ) {
    return true;
  }
  return !content.trim();
}

/**
 * Pure regex static fallback for CSS/DOM mount reconstruction when Web Worker is unavailable
 * (e.g. headless environments or strict worker failure).
 */
function staticReconstructInjectors(scripts: string[], mountIds: string[]) {
  const styles: string[] = [];
  const mounts: Record<string, string> = {};
  const writes: string[] = [];
  const injectorScriptIndexes: number[] = [];

  for (let idx = 0; idx < scripts.length; idx++) {
    const code = scripts[idx];
    let hit = false;

    // 1. style.textContent / style.innerHTML = "..."
    const styleMatch = /createElement\s*\(\s*['"]style['"]\s*\)[\s\S]{0,200}?\.(?:textContent|innerHTML)\s*=\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/i.exec(code);
    if (styleMatch) {
      const lit = styleMatch[1];
      const css = unescapeJsQuotedString(lit.slice(1, -1), lit[0]);
      if (css && !/^\s*\*\s*\{\s*-webkit-user-select:\s*none/i.test(css)) {
        styles.push(css);
        hit = true;
      }
    }

    // 2. Combined pairs var _m = [["id","html"], ...]
    const pairArrMatch = /var\s+_m\s*=\s*(\[\s*\[[\s\S]*?\]\s*\])\s*;/.exec(code);
    if (pairArrMatch) {
      try {
        const parsed = JSON.parse(pairArrMatch[1]);
        if (Array.isArray(parsed)) {
          for (const pair of parsed) {
            if (Array.isArray(pair) && typeof pair[0] === 'string' && typeof pair[1] === 'string') {
              mounts[pair[0]] = pair[1];
              hit = true;
            }
          }
        }
      } catch {
        // Ignore parse error
      }
    }

    // 3. Direct getElementById('mountId')...innerHTML = "..."
    for (const id of mountIds) {
      const singleMountRegex = new RegExp(
        `getElementById\\s*\\(\\s*['"]${escapeRegex(id)}['"]\\s*\\)[\\s\\S]{0,120}?\\.innerHTML\\s*=\\s*("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`,
        'i'
      );
      const m = singleMountRegex.exec(code);
      if (m) {
        const lit = m[1];
        mounts[id] = unescapeJsQuotedString(lit.slice(1, -1), lit[0]);
        hit = true;
      }
    }

    if (hit) {
      injectorScriptIndexes.push(idx);
    }
  }

  return { styles, mounts, writes, injectorScriptIndexes };
}

/**
 * Stage 3: Runs non-module inline scripts inside the network-free sandbox worker (3s timeout)
 * to extract injected CSS (<style>) and DOM mount HTML (.innerHTML), and places them cleanly
 * back into the HTML or Blogger XML structure while leaving interactive & module scripts intact.
 */
async function reconstructCssAndDomMounts(
  source: string,
  format: TargetFormat,
  indentSize: number
): Promise<{ code: string; reconstructed: boolean; itemsRecovered: number }> {
  if (format !== 'html' && format !== 'blogger') {
    return { code: source, reconstructed: false, itemsRecovered: 0 };
  }

  if (!/<script\b/i.test(source)) {
    return { code: source, reconstructed: false, itemsRecovered: 0 };
  }

  // Extract all id='...' / id="..." present in document
  const mountIdSet = new Set<string>();
  const idAttrRegex = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let idm: RegExpExecArray | null;
  while ((idm = idAttrRegex.exec(source)) !== null) {
    const idVal = (idm[1] || idm[2] || '').trim();
    if (idVal) mountIdSet.add(idVal);
  }
  const mountIds = Array.from(mountIdSet);

  // Extract candidate inline non-module scripts
  interface SlotEntry {
    token: string;
    rawMatch: string;
    candidateIdx: number | null;
  }
  const slots: SlotEntry[] = [];
  const candidateScripts: string[] = [];

  let working = source.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (rawMatch, attrs, content) => {
      const token = `__CG_SB_SLOT_${slots.length}__`;
      if (shouldSkipSandboxScript(attrs, content)) {
        slots.push({ token, rawMatch, candidateIdx: null });
        return token;
      }

      const cleanedJs = content
        .replace(/\/\/<!\[CDATA\[/gi, '')
        .replace(/\/\/\]\]>/gi, '')
        .replace(/<!\[CDATA\[/gi, '')
        .replace(/\]\]>/gi, '')
        .trim();

      const candidateIdx = candidateScripts.length;
      candidateScripts.push(cleanedJs);
      slots.push({ token, rawMatch, candidateIdx });
      return token;
    }
  );

  if (candidateScripts.length === 0) {
    return { code: source, reconstructed: false, itemsRecovered: 0 };
  }

  let sandboxRes =
    typeof Worker !== 'undefined'
      ? await runRestoreSandboxWorker(candidateScripts, mountIds)
      : staticReconstructInjectors(candidateScripts, mountIds);

  // Fallback check if browser worker produced nothing for plaintext patterns
  if (
    sandboxRes.styles.length === 0 &&
    Object.keys(sandboxRes.mounts).length === 0 &&
    sandboxRes.writes.length === 0
  ) {
    const staticFallback = staticReconstructInjectors(candidateScripts, mountIds);
    if (staticFallback.styles.length > 0 || Object.keys(staticFallback.mounts).length > 0) {
      sandboxRes = staticFallback;
    }
  }

  let itemsRecovered = 0;
  let reconstructed = false;

  // 1. Restore captured <style> CSS back into <b:skin> (Blogger) or <style> (HTML)
  if (sandboxRes.styles.length > 0) {
    reconstructed = true;
    itemsRecovered += sandboxRes.styles.length;
    const rawCss = sandboxRes.styles.join('\n\n');
    let formattedCss = rawCss;
    try {
      formattedCss = beautify.css(rawCss, { indent_size: indentSize, end_with_newline: false });
    } catch {
      // Keep raw CSS
    }

    if (format === 'blogger') {
      const placeholderSkin = /(<b:skin\b[^>]*>\s*<!\[CDATA\[)\s*(?:\/\*[\s\S]*?\*\/)?\s*(\]\]>\s*<\/b:skin>)/i;
      const anySkin = /(<b:skin\b[^>]*>\s*<!\[CDATA\[)([\s\S]*?)(\]\]>\s*<\/b:skin>)/i;

      if (placeholderSkin.test(working)) {
        working = working.replace(placeholderSkin, (_m, open, close) => `${open}\n${formattedCss}\n${close}`);
      } else if (anySkin.test(working)) {
        working = working.replace(anySkin, (_m, open, inner, close) => {
          const base = inner.trim();
          return `${open}\n${base ? `${base}\n\n` : ''}${formattedCss}\n${close}`;
        });
      } else if (/<\/head>/i.test(working)) {
        working = working.replace(/<\/head>/i, () => `<style>\n${formattedCss}\n</style>\n</head>`);
      } else {
        working = `<style>\n${formattedCss}\n</style>\n${working}`;
      }
    } else {
      const styleBlock = `<style>\n${formattedCss}\n</style>`;
      if (/<\/head>/i.test(working)) {
        working = working.replace(/<\/head>/i, () => `${styleBlock}\n</head>`);
      } else if (/<body\b[^>]*>/i.test(working)) {
        working = working.replace(/(<body\b[^>]*>)/i, (m) => `${styleBlock}\n${m}`);
      } else {
        working = `${styleBlock}\n${working}`;
      }
    }
  }

  // 2. Restore captured DOM mount HTML back into mount containers
  const mountEntries = Object.entries(sandboxRes.mounts);
  if (mountEntries.length > 0) {
    reconstructed = true;
    for (const [mountId, htmlInner] of mountEntries) {
      if (!htmlInner) continue;
      itemsRecovered++;

      if (mountId === 'cg-app-mount') {
        const appMountRegex = /<div\b[^>]*\bid\s*=\s*["']cg-app-mount["'][^>]*>\s*<\/div>/i;
        if (appMountRegex.test(working)) {
          working = working.replace(appMountRegex, () => htmlInner);
          continue;
        }
      }

      const emptyContainerRegex = new RegExp(
        `(<([a-zA-Z][a-zA-Z0-9:-]*)\\b[^>]*\\bid\\s*=\\s*["']${escapeRegex(mountId)}["'][^>]*>)\\s*(<\\/\\2>)`,
        'i'
      );

      if (emptyContainerRegex.test(working)) {
        working = working.replace(emptyContainerRegex, (_m, openTag, _tagName, closeTag) => {
          // Strip auto-generated cg-*-mount IDs so output markup stays clean
          const cleanedOpenTag = /^cg-(?:header|footer|home|ui)-mount(?:-\d+)?$/.test(mountId)
            ? openTag.replace(/\s+\bid\s*=\s*["'][^"']+["']/i, '')
            : openTag;
          return `${cleanedOpenTag}\n${htmlInner}\n${closeTag}`;
        });
      }
    }
  }

  // 3. Restore or remove consumed injector script slots cleanly
  const injectorSet = new Set(sandboxRes.injectorScriptIndexes);
  for (const slot of slots) {
    if (slot.candidateIdx !== null && injectorSet.has(slot.candidateIdx)) {
      const js = candidateScripts[slot.candidateIdx] || '';
      const hasOnlyWrites =
        sandboxRes.writes.length > 0 &&
        /document\.write/i.test(js) &&
        !/createElement\s*\(\s*['"]style['"]|\.innerHTML\s*=/i.test(js);

      if (hasOnlyWrites) {
        itemsRecovered++;
        reconstructed = true;
        working = working.replace(slot.token, () => sandboxRes.writes.join('\n'));
      } else {
        working = working.replace(slot.token, '');
      }
    } else {
      working = working.replace(slot.token, () => slot.rawMatch);
    }
  }

  return {
    code: working.trim(),
    reconstructed,
    itemsRecovered,
  };
}

/**
 * Formats <b:skin> / <b:template-skin> content while keeping <Variable>, <Group>, and <b:*> lines clean.
 */
function formatBloggerSkinBody(inner: string, indentSize: number): string {
  const cdataMatch = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i.exec(inner);
  const hasCdata = Boolean(cdataMatch);
  const content = (cdataMatch ? cdataMatch[1] : inner).trim();
  if (!content) {
    return hasCdata ? '<![CDATA[]]>' : '';
  }

  const directives: string[] = [];
  let tokenized = content.replace(/<(?:Variable|Group|b:)[^>]*\/?>/gi, (m) => {
    const tok = `/*__CG_SKIN_DIR_${directives.length}__*/`;
    directives.push(m.trim());
    return `\n${tok}\n`;
  });

  try {
    tokenized = beautify.css(tokenized, {
      indent_size: indentSize,
      preserve_newlines: true,
      max_preserve_newlines: 2,
      end_with_newline: false,
    });
  } catch {
    // Preserve raw if CSS has custom non-standard expressions
  }

  for (let i = 0; i < directives.length; i++) {
    tokenized = tokenized.replace(`/*__CG_SKIN_DIR_${i}__*/`, () => directives[i]);
  }

  if (hasCdata) {
    return `<![CDATA[\n${tokenized.trim()}\n]]>`;
  }
  return `\n${tokenized.trim()}\n`;
}

/**
 * XML-safe tag indenter that preserves Blogger directives, self-closing tags (<data:.../>, <meta .../>),
 * attributes (expr:*), and text content cleanly without breaking XML syntax.
 */
function indentBloggerXmlTokens(xml: string, indentSize: number): string {
  const tokens: Array<{ type: 'tag' | 'text'; value: string }> = [];
  let pos = 0;
  const len = xml.length;

  while (pos < len) {
    const lt = xml.indexOf('<', pos);
    if (lt === -1) {
      const text = xml.slice(pos).trim();
      if (text) tokens.push({ type: 'text', value: text });
      break;
    }

    if (lt > pos) {
      const text = xml.slice(pos, lt).trim();
      if (text) tokens.push({ type: 'text', value: text });
    }

    // Read full tag <...> respecting single & double quotes
    let end = lt + 1;
    let quote: '"' | "'" | null = null;
    while (end < len) {
      const ch = xml[end];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === '>') {
        break;
      }
      end++;
    }

    const tagStr = xml.slice(lt, end + 1);
    tokens.push({ type: 'tag', value: tagStr });
    pos = end + 1;
  }

  const lines: string[] = [];
  let depth = 0;
  const unit = ' '.repeat(indentSize);

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.type === 'text') {
      lines.push(`${unit.repeat(depth)}${tok.value}`);
      continue;
    }

    const val = tok.value;

    // Closing tag </tag>
    if (/^<\//.test(val)) {
      depth = Math.max(0, depth - 1);
      lines.push(`${unit.repeat(depth)}${val}`);
      continue;
    }

    // Declaration, doctype, comment, or placeholder token
    if (/^<\?|^<!/.test(val)) {
      lines.push(`${unit.repeat(depth)}${val}`);
      continue;
    }

    const nameMatch = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(val);
    const tagName = nameMatch ? nameMatch[1].toLowerCase() : '';
    const isSelfClosing = /\/>\s*$/.test(val) || VOID_HTML_TAGS.has(tagName);

    // Inline <tag>short text</tag> kept cleanly on one line
    const next1 = tokens[i + 1];
    const next2 = tokens[i + 2];
    if (
      !isSelfClosing &&
      next1?.type === 'text' &&
      !next1.value.includes('\n') &&
      next1.value.length <= 90 &&
      next2?.type === 'tag' &&
      new RegExp(`^</${escapeRegex(tagName)}\\s*>$`, 'i').test(next2.value)
    ) {
      lines.push(`${unit.repeat(depth)}${val}${next1.value}${next2.value}`);
      i += 2;
      continue;
    }

    // Empty container <tag></tag> kept cleanly on one line
    if (
      !isSelfClosing &&
      next1?.type === 'tag' &&
      new RegExp(`^</${escapeRegex(tagName)}\\s*>$`, 'i').test(next1.value)
    ) {
      lines.push(`${unit.repeat(depth)}${val}${next1.value}`);
      i += 1;
      continue;
    }

    lines.push(`${unit.repeat(depth)}${val}`);
    if (!isSelfClosing) {
      depth++;
    }
  }

  return lines.join('\n');
}

/**
 * Formats Blogger XML safely while keeping <?xml?>, <!DOCTYPE>, <b:skin><![CDATA[...]]></b:skin>,
 * <script>//<![CDATA[...//]]></script>, comments, and verbatim tags intact.
 */
function formatBloggerXmlSafely(xmlInput: string, indentSize: number): string {
  const slots: Array<{ token: string; content: string }> = [];

  const hold = (content: string) => {
    const token = `__CG_XML_HOLD_${slots.length}__`;
    slots.push({ token, content });
    return token;
  };

  let working = xmlInput.trim();

  // Hold XML declarations & DOCTYPE
  working = working.replace(/<\?xml[\s\S]*?\?>/gi, (m) => hold(m.trim()));
  working = working.replace(/<!DOCTYPE[\s\S]*?>/gi, (m) => hold(m.trim()));

  // Hold <b:skin> and <b:template-skin> after formatting their CSS cleanly
  working = working.replace(
    /(<b:(?:skin|template-skin)\b[^>]*>)([\s\S]*?)(<\/b:(?:skin|template-skin)>)/gi,
    (_m, open, inner, close) => {
      const formattedBody = formatBloggerSkinBody(inner, indentSize);
      return hold(`${open}\n${formattedBody}\n${close}`);
    }
  );

  // Hold <script> blocks cleanly (re-formatting JS & preserving //<![CDATA[ ... //]]>)
  working = working.replace(
    /(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/gi,
    (rawMatch, openTag, attrs, inner, closeTag) => {
      if (/\bsrc\s*=/i.test(attrs) || openTag.trim().endsWith('/>')) {
        return hold(rawMatch);
      }

      if (/<b:|<\/b:|<data:|<expr:/i.test(inner)) {
        return hold(rawMatch);
      }

      const isJson = /\btype\s*=\s*["']?(?:application\/(?:ld\+)?json|importmap)["']?/i.test(attrs);
      const cleanJs = inner
        .replace(/\/\/<!\[CDATA\[/gi, '')
        .replace(/\/\/\]\]>/gi, '')
        .replace(/<!\[CDATA\[/gi, '')
        .replace(/\]\]>/gi, '')
        .trim();

      if (!cleanJs) {
        return hold(rawMatch);
      }

      let formattedJs = cleanJs;
      try {
        formattedJs = beautify.js(cleanJs, {
          indent_size: indentSize,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          wrap_line_length: 0,
          end_with_newline: false,
        });
      } catch {
        // Keep raw JS on parse edge cases
      }

      if (isJson) {
        return hold(`${openTag}\n${formattedJs}\n${closeTag}`);
      }
      return hold(`${openTag}\n//<![CDATA[\n${formattedJs}\n//]]>\n${closeTag}`);
    }
  );

  // Hold comments, <style>, <pre>, <textarea>, <svg>
  working = working.replace(/<!--[\s\S]*?-->/g, (m) => hold(m));
  working = working.replace(/(<(style|pre|textarea|svg)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi, (m, o, tag, inner, c) => {
    if (tag.toLowerCase() === 'style' && !/<b:|<data:|<expr:/i.test(inner)) {
      try {
        const css = beautify.css(inner.trim(), { indent_size: indentSize, end_with_newline: false });
        return hold(`${o}\n${css}\n${c}`);
      } catch {
        return hold(m);
      }
    }
    return hold(m);
  });

  let formatted = indentBloggerXmlTokens(working, indentSize);

  // Restore held tokens in reverse order so nested holdings never miss
  for (let i = slots.length - 1; i >= 0; i--) {
    const slot = slots[i];
    formatted = formatted.replace(slot.token, () => slot.content);
  }

  return formatted.trim() + '\n';
}

/**
 * Formats output cleanly according to selected format without breaking UTF-8/Bengali text.
 */
function formatCodeByType(code: string, format: TargetFormat, indentSize: number): string {
  const baseOpts = {
    indent_size: indentSize,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    wrap_line_length: 0,
    end_with_newline: true,
  };

  if (format === 'javascript') {
    return beautify.js(code, baseOpts);
  }
  if (format === 'css') {
    return beautify.css(code, baseOpts);
  }
  if (format === 'blogger') {
    return formatBloggerXmlSafely(code, indentSize);
  }
  return beautify.html(code, {
    ...baseOpts,
    indent_inner_html: true,
    extra_liners: ['head', 'body', '/html'],
    content_unformatted: ['pre', 'code', 'textarea'],
  });
}

/**
 * Executes the 4-Stage Restore, Decode & Beautify Engine:
 *   Stage 1: Local Vault SHA-256 hash match recovery
 *   Stage 2: Up to 12 passes of iterative decoding (wrappers, UTF-8 Base64, Dean Edwards, CharCode, Hex, Unicode, HTML entities, simple _0x lookup)
 *   Stage 3: Virtual DOM Web Worker reconstruction (CSS & DOM mounts)
 *   Stage 4: Language-aware Beautifier + Blogger XML validation
 */
export async function restoreCode(
  inputCode: string,
  format: TargetFormat,
  options: Partial<RestoreOptions> = {}
): Promise<RestoreResult> {
  const startTime = performance.now();
  const indentSize = options.indentSize || 2;
  const beautifyOnly = Boolean(options.beautifyOnly);
  const notes: string[] = [];

  let currentCode = inputCode.trim();
  let itemsDecoded = 0;
  let passesUsed = 0;
  let vaultRecovered = false;
  let sandboxReconstructed = false;

  // --- STAGE 1: Smart Local Vault Recovery ---
  if (!beautifyOnly && currentCode) {
    try {
      const vaultMatch = await findVaultMatch(currentCode);
      if (vaultMatch && vaultMatch.originalCode.trim()) {
        vaultRecovered = true;
        itemsDecoded = 1;
        passesUsed = 1;
        currentCode = vaultMatch.originalCode;
        notes.push('Restored exact original source from your local browser vault.');
      }
    } catch {
      // Continue silently to Stage 2
    }
  }

  // --- STAGE 2: Multi-Pass Iterative Decoder (up to 12 passes) ---
  if (!beautifyOnly && !vaultRecovered && currentCode) {
    for (let pass = 1; pass <= MAX_DECODE_PASSES; pass++) {
      let passChanges = 0;

      const entityRes = decodeEntityEncodedHtml(currentCode);
      if (entityRes.count > 0) {
        currentCode = entityRes.result;
        passChanges += entityRes.count;
      }

      const packerRes = unpackDeanEdwards(currentCode);
      if (packerRes.count > 0) {
        currentCode = packerRes.result;
        passChanges += packerRes.count;
      }

      const wrapRes = decodeWrappersAndBase64(currentCode);
      if (wrapRes.count > 0) {
        currentCode = wrapRes.result;
        passChanges += wrapRes.count;
      }

      const charRes = decodeFromCharCode(currentCode);
      if (charRes.count > 0) {
        currentCode = charRes.result;
        passChanges += charRes.count;
      }

      const strongLocked = detectStrongObfuscation(currentCode);

      if (!strongLocked) {
        const arrRes = decodeSimpleStringArray(currentCode);
        if (arrRes.count > 0) {
          currentCode = arrRes.result;
          passChanges += arrRes.count;
        }

        const hexRes = deescapeHexStrings(currentCode);
        if (hexRes.count > 0) {
          currentCode = hexRes.result;
          passChanges += hexRes.count;
        }

        const uniRes = deescapeUnicodeStrings(currentCode);
        if (uniRes.count > 0) {
          currentCode = uniRes.result;
          passChanges += uniRes.count;
        }
      }

      if (passChanges === 0) break;

      passesUsed = pass;
      itemsDecoded += passChanges;
    }

    if (itemsDecoded > 0) {
      notes.push(`Decoded ${itemsDecoded} encoded item(s) across ${passesUsed} pass(es).`);
    }
  }

  // --- STAGE 3: CSS & DOM Mount Injector Reconstructor (Network-Free Sandbox) ---
  if (!beautifyOnly && !vaultRecovered && (format === 'html' || format === 'blogger')) {
    const recon = await reconstructCssAndDomMounts(currentCode, format, indentSize);
    if (recon.reconstructed) {
      currentCode = recon.code;
      sandboxReconstructed = true;
      itemsDecoded += recon.itemsRecovered;
      passesUsed = Math.max(passesUsed, 1);
      notes.push('Reconstructed embedded styles and layout blocks into clean markup.');
    }
  }

  // --- STAGE 4: Accurate Language-Aware Beautifier ---
  let formattedCode = currentCode;
  try {
    formattedCode = formatCodeByType(currentCode, format, indentSize);
    if (format === 'blogger') {
      notes.push('Formatted Blogger XML cleanly while preserving theme tags and blocks.');
    } else if (format === 'html') {
      notes.push('Formatted HTML, embedded styles, and scripts cleanly.');
    } else if (format === 'css') {
      notes.push('Formatted CSS stylesheet cleanly.');
    } else {
      notes.push('Formatted JavaScript code cleanly.');
    }
  } catch {
    notes.push('Formatting completed with best-effort structure preservation.');
  }

  const xmlValidationError =
    format === 'blogger' ? validateBloggerXml(formattedCode) : null;

  const nonReversibleLocked =
    !beautifyOnly &&
    !vaultRecovered &&
    !sandboxReconstructed &&
    itemsDecoded === 0 &&
    detectStrongObfuscation(inputCode);

  const durationMs = Math.round(performance.now() - startTime);

  return {
    code: formattedCode,
    stats: {
      originalSize: inputCode.length,
      restoredSize: formattedCode.length,
      itemsDecoded,
      passesUsed,
      vaultRecovered,
      sandboxReconstructed,
      formatApplied: format,
      durationMs,
    },
    notes,
    nonReversibleLocked,
    xmlValidationError,
  };
}
