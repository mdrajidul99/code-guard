import { SecureOptions } from '../types/index.ts';
import { minifyCss } from './cssEngine.ts';
import { minifyJs } from './jsEngine.ts';

/**
 * Minifies HTML code safely in the browser, preserving structural tags,
 * event handlers, attributes, and special elements.
 */
export function minifyHtml(html: string, options: Partial<SecureOptions> = {}): string {
  let output = html;

  // 1. Minify inline <style> blocks if enabled
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

  // 2. Minify inline <script> blocks (excluding JSON-LD or custom template types)
  if (options.htmlMinifyInlineJs !== false) {
    output = output.replace(/(<script\b(?![^>]*\btype=["'](?:application\/ld\+json|text\/template|text\/x-template)["'])[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, openTag, jsContent, closeTag) => {
      try {
        const minified = minifyJs(jsContent, {
          jsMinifyWhitespace: true,
          jsRemoveComments: options.htmlRemoveComments !== false,
        });
        return `${openTag}${minified}${closeTag}`;
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
    // Stash pre and textarea blocks
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

  // 5. Optional Protected HTML Container mode
  if (options.htmlProtectContainer) {
    output = createProtectedHtmlContainer(output);
  }

  return output.trim();
}

/**
 * Packages HTML into a self-rendering protected container.
 * This makes raw inspection and casual scraping significantly harder,
 * while executing seamlessly in standard web browsers.
 */
export function createProtectedHtmlContainer(htmlSource: string): string {
  // Convert source to UTF-8 safe base64
  const bytes = new TextEncoder().encode(htmlSource);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  return `<!DOCTYPE html>
<!-- Protected by CodeGaurd (MRS Engineers BD) -->
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protected Document</title>
</head>
<body>
  <div id="__cg_root__"></div>
  <script>
    (function(){
      var _0xdata = "${base64Data}";
      function _0xrender() {
        try {
          var _0xbin = atob(_0xdata);
          var _0xbytes = new Uint8Array(_0xbin.length);
          for(var i=0; i<_0xbin.length; i++) { _0xbytes[i] = _0xbin.charCodeAt(i); }
          var _0xdecoded = new TextDecoder('utf-8').decode(_0xbytes);
          document.open();
          document.write(_0xdecoded);
          document.close();
        } catch(e) {
          console.error("CodeGaurd container extraction error:", e);
        }
      }
      if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _0xrender);
      } else {
        _0xrender();
      }
    })();
  </script>
  <noscript>Please enable JavaScript to view this secure document.</noscript>
</body>
</html>`;
}
