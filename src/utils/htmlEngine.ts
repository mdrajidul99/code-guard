import { SecureOptions } from '../types/index.ts';
import { minifyCss } from './cssEngine.ts';
import { minifyJs, obfuscateJs } from './jsEngine.ts';

/**
 * Minifies HTML code safely in the browser, preserving structural tags,
 * event handlers, attributes, and special elements.
 */
export function minifyHtml(html: string, options: Partial<SecureOptions> = {}): string {
  let output = html;

  // 1. Minify/Obfuscate inline <style> blocks if enabled
  if (options.htmlMinifyInlineCss !== false) {
    output = output.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, openTag, cssContent, closeTag) => {
      try {
        const minified = minifyCss(cssContent, {
          cssMinifyWhitespace: true,
          cssRemoveComments: options.htmlRemoveComments !== false,
          cssShortenHexColors: true,
          cssRemoveZeroUnits: true,
        });
        return `${openTag}${minified}${closeTag}`;
      } catch {
        return match;
      }
    });
  }

  // 2. Minify/Obfuscate inline <script> blocks (excluding JSON-LD or custom template types)
  if (options.htmlMinifyInlineJs !== false) {
    output = output.replace(/(<script\b(?![^>]*\btype=["'](?:application\/ld\+json|text\/template|text\/x-template)["'])[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, openTag, jsContent, closeTag) => {
      try {
        if (!jsContent.trim()) return match;
        // Obfuscate inline JavaScript when high protection is active
        const processedJs = options.jsMangleIdentifiers || options.jsEncodeStringsHex || options.jsStringArrayRotation
          ? obfuscateJs(jsContent, options)
          : minifyJs(jsContent, {
              jsMinifyWhitespace: true,
              jsRemoveComments: options.htmlRemoveComments !== false,
            });
        return `${openTag}${processedJs}${closeTag}`;
      } catch {
        return match;
      }
    });
  }

  // 3. Remove non-essential HTML comments (preserving IE conditionals <!--[if ...]> and SSI)
  if (options.htmlRemoveComments !== false) {
    output = output.replace(/<!--(?!\s*(?:\[if|#))\s*[\s\S]*?-->/g, '');
  }

  // 4. Whitespace compression while carefully preserving <pre>, <textarea>, and <code> blocks
  if (options.htmlMinifyWhitespace !== false) {
    const preservedBlocks: string[] = [];
    output = output.replace(/(<(?:pre|textarea|code)\b[^>]*>[\s\S]*?<\/(?:pre|textarea|code)>)/gi, (match) => {
      const token = `__PRESERVED_BLOCK_${preservedBlocks.length}__`;
      preservedBlocks.push(match);
      return token;
    });

    // Collapse whitespace around tags
    output = output
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<');

    // Restore preserved blocks
    preservedBlocks.forEach((block, index) => {
      output = output.replace(`__PRESERVED_BLOCK_${index}__`, block);
    });
  }

  // 5. Protected HTML Container mode (Default: ON for real source-code protection)
  if (options.htmlProtectContainer !== false) {
    output = createProtectedHtmlContainer(output);
  }

  return output.trim();
}

/**
 * Packages HTML into an ultra-secure, encrypted self-executing container.
 * Features:
 * - Multi-layer dynamic XOR + Base64 encryption of all source markup
 * - Complete hiding of raw HTML from browser "View Source" (Ctrl+U)
 * - Anti-Right-Click / Context menu blocking
 * - Anti-Developer Tools / Inspection shortcut block (F12, Ctrl+Shift+I, etc.)
 * - Anti-Debugging execution trap (freezes DevTools in infinite halt loop)
 * - Console suppressor to avoid data leakage
 * - 100% Seamless client-side execution in all modern web browsers
 */
export function createProtectedHtmlContainer(htmlSource: string): string {
  // Generate random XOR encryption key
  const xorKey = Math.floor(Math.random() * 200) + 25; // 25..224

  // UTF-8 encode source string to bytes
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(htmlSource);
  
  // Encrypt with XOR
  const encryptedBytes = new Uint8Array(rawBytes.length);
  for (let i = 0; i < rawBytes.length; i++) {
    encryptedBytes[i] = rawBytes[i] ^ ((xorKey + (i % 31)) & 0xff);
  }

  // Convert to Base64 safely
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < encryptedBytes.length; i += chunkSize) {
    const chunk = encryptedBytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const payload = btoa(binary);

  // Return standalone protected executable HTML container
  return `<!DOCTYPE html>
<!-- ======================================================= -->
<!-- Code Protected by CodeGaurd Ultra Shield Engine       -->
<!-- High-Strength Anti-Inspection & Anti-Tamper Security  -->
<!-- ======================================================= -->
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protected Webpage</title>
  <style>
    /* Security Loader Screen */
    #__cg_shield_loader__ {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #090d16; color: #38bdf8;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 999999;
    }
    .cg-spinner {
      width: 40px; height: 40px; border: 3px solid rgba(56,189,248,0.2);
      border-top-color: #38bdf8; border-radius: 50%;
      animation: cg-spin 0.8s linear infinite; margin-bottom: 16px;
    }
    @keyframes cg-spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="__cg_shield_loader__">
    <div class="cg-spinner"></div>
    <div style="font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">Initializing Secured Application...</div>
  </div>

  <script>
  (function(){
    'use strict';
    var _0xk = ${xorKey};
    var _0xp = "${payload}";

    // --- Layer 1: Anti-Right Click (Context Menu Blocker) ---
    document.addEventListener('contextmenu', function(e){
      e.preventDefault();
      return false;
    }, true);

    // --- Layer 2: Anti-DevTools & Shortcut Shield ---
    document.addEventListener('keydown', function(e){
      var k = (e.key || '').toUpperCase();
      var c = e.ctrlKey || e.metaKey;
      // Block F12
      if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault(); e.stopPropagation(); return false;
      }
      // Block Ctrl+Shift+I / J / C (Inspect / Console)
      if (c && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) {
        e.preventDefault(); e.stopPropagation(); return false;
      }
      // Block Ctrl+U (View Source)
      if (c && k === 'U') {
        e.preventDefault(); e.stopPropagation(); return false;
      }
      // Block Ctrl+S (Save Page)
      if (c && k === 'S') {
        e.preventDefault(); e.stopPropagation(); return false;
      }
    }, true);

    // --- Layer 3: Anti-Debugging Endless Trap ---
    function _0xtrap() {
      try {
        (function(){}).constructor("debugger")();
      } catch(e){}
    }
    setInterval(_0xtrap, 800);

    // --- Layer 4: Console Silence ---
    try {
      var _c = ['log', 'debug', 'info', 'warn', 'error', 'dir', 'table', 'clear'];
      for (var i = 0; i < _c.length; i++) {
        if (window.console) window.console[_c[i]] = function(){};
      }
    } catch(e){}

    // --- Layer 5: Decrypt and Mount Application ---
    function _0xboot() {
      try {
        var _bin = atob(_0xp);
        var _len = _bin.length;
        var _bytes = new Uint8Array(_len);
        for (var i = 0; i < _len; i++) {
          _bytes[i] = _bin.charCodeAt(i) ^ ((_0xk + (i % 31)) & 0xff);
        }
        var _html = new TextDecoder('utf-8').decode(_bytes);

        // Mount the decrypted document
        document.open();
        document.write(_html);
        document.close();

        // Re-attach security shield inside newly written document
        document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, true);
        document.addEventListener('keydown', function(e){
          var k = (e.key || '').toUpperCase();
          var c = e.ctrlKey || e.metaKey;
          if (e.keyCode === 123 || e.key === 'F12' || (c && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) || (c && (k === 'U' || k === 'S'))) {
            e.preventDefault(); e.stopPropagation(); return false;
          }
        }, true);
        setInterval(_0xtrap, 800);
      } catch(err) {
        var l = document.getElementById('__cg_shield_loader__');
        if (l) l.innerHTML = '<div style="color:#ef4444;font-size:13px;">Security decryption error.</div>';
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _0xboot);
    } else {
      _0xboot();
    }
  })();
  </script>
  <noscript>
    <div style="padding: 24px; text-align: center; font-family: sans-serif; color: #ef4444;">
      JavaScript is required to view this protected application.
    </div>
  </noscript>
</body>
</html>`;
}
