import { SecureOptions } from '../types/index.ts';
import { minifyCss } from './cssEngine.ts';
import { encodeUtf8ToBase64 } from './encodingUtils.ts';

/**
 * Encodes HTML into a standalone, ultra-reliable self-executing container.
 * - Encodes all markup, tags, attributes, and scripts into a UTF-8 Base64 payload.
 * - Inlines dynamically via document.write() without calling document.open(),
 *   ensuring it NEVER wipes out parent websites, Blogger gadgets, or WordPress pages.
 * - Completely hides raw HTML source from casual browsing and "View Source".
 * - 100% compatible with modern browsers, mobile browsers, and embeds.
 */
export function encodeHtml(htmlSource: string): string {
  const trimmed = htmlSource.trim();
  if (!trimmed) return '';

  const encodedBase64 = encodeUtf8ToBase64(trimmed);

  return `<!-- ======================================================== -->
<!-- Code Protected & Encoded by CodeGaurd Ultra Shield Engine -->
<!-- ======================================================== -->
<script type="text/javascript">
/* CodeGaurd Self-Executing Encoded HTML Runner */
(function() {
  var _0xdata = "${encodedBase64}";
  try {
    var _bin = window.atob(_0xdata);
    var _len = _bin.length;
    var _bytes = new Uint8Array(_len);
    for (var i = 0; i < _len; i++) {
      _bytes[i] = _bin.charCodeAt(i);
    }
    var _html = new TextDecoder('utf-8').decode(_bytes);
    document.write(_html);
  } catch(e) {
    document.write(decodeURIComponent(escape(window.atob(_0xdata))));
  }
})();
</script>
<noscript>
  <div style="padding:16px;text-align:center;color:#ef4444;font-family:sans-serif;">
    Please enable JavaScript to view this protected webpage.
  </div>
</noscript>`;
}

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

  // 2. Remove non-essential HTML comments (preserving IE conditionals <!--[if ...]> and SSI)
  if (options.htmlRemoveComments !== false) {
    output = output.replace(/<!--(?!\s*(?:\[if|#))\s*[\s\S]*?-->/g, '');
  }

  // 3. Whitespace compression while carefully preserving <pre>, <textarea>, and <code> blocks
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

  return output.trim();
}
