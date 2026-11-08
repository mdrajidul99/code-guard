/**
 * Comprehensive Unicode & UTF-8 safe encoding and decoding utilities.
 * Handles emojis, Bengali, Arabic, and all multibyte characters cleanly
 * across modern browser runtimes and Node.js.
 */

export function encodeUtf8ToBase64(str: string): string {
  if (!str) return '';
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  } catch {
    // Fallback for older environments
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export function decodeBase64ToUtf8(b64: string): string {
  if (!b64) return '';
  const cleaned = b64.trim().replace(/\s+/g, '');
  try {
    const binary = atob(cleaned);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    try {
      return decodeURIComponent(escape(atob(cleaned)));
    } catch {
      return atob(cleaned);
    }
  }
}

/**
 * Encodes ASCII string into hex escape sequences (\xHH).
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
 * Decodes hex escape sequences (\xHH) to characters.
 */
export function decodeHexString(str: string): string {
  return str.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    try {
      const code = parseInt(hex, 16);
      return String.fromCharCode(code);
    } catch {
      return match;
    }
  });
}
