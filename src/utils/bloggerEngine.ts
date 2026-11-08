import { SecureOptions } from '../types/index.ts';
import { minifyCss } from './cssEngine.ts';
import { encodeUtf8ToBase64, decodeBase64ToUtf8 } from './encodingUtils.ts';

/**
 * Validates whether the given string is valid XML structure.
 * Returns null if valid, or an error string if invalid.
 */
export function validateBloggerXml(xmlString: string): string | null {
  if (typeof DOMParser === 'undefined') return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return parserError.textContent || 'Unknown XML Syntax Validation Error';
    }
    return null;
  } catch (err: unknown) {
    return err instanceof Error ? err.message : String(err);
  }
}

/**
 * Determines whether the code is a full Blogger XML template or an isolated gadget/snippet.
 */
export function isFullBloggerTemplate(code: string): boolean {
  return /<b:skin\b|<b:section\b|<b:widget\b|xmlns:b=/i.test(code);
}

/**
 * Processes Blogger XML templates and widgets with 100% Blogger Theme Editor compatibility.
 * - For Full Blogger Templates:
 *   1. Preserves all Blogger tags (<b:skin>, <b:section>, <b:widget>, <b:includable>, <data:.../>)
 *      so that the Blogger Theme Editor NEVER throws XML parsing or layout errors.
 *   2. Automatically encodes custom JavaScript scripts inside <script> tags into
 *      Blogger-compliant //<![CDATA[ ... //]]> self-executing Base64 runners.
 *   3. Safely minifies CSS inside <b:skin><![CDATA[ ... ]]></b:skin> while keeping Blogger variables intact.
 * - For Blogger Gadgets / Snippets:
 *   Wraps the snippet into an XML-safe CDATA runner that can be placed in Blogger widgets or theme HTML.
 */
export function processBloggerXml(xmlCode: string, options: Partial<SecureOptions> = {}): string {
  const trimmed = xmlCode.trim();
  if (!trimmed) return '';

  const isFullTheme = isFullBloggerTemplate(trimmed);

  if (isFullTheme) {
    let output = trimmed;

    // 1. Minify CSS inside <b:skin><![CDATA[ ... ]]></b:skin>
    if (options.bloggerMinifyCdataCss !== false) {
      output = output.replace(
        /(<b:skin\b[^>]*>\s*<!\[CDATA\[)([\s\S]*?)(\]\]>\s*<\/b:skin>)/gi,
        (match, openPrefix, cssContent, closeSuffix) => {
          try {
            const minified = minifyCss(cssContent, {
              cssMinifyWhitespace: true,
              cssRemoveComments: false, // Keep Blogger variable definitions intact
              cssShortenHexColors: true,
              cssRemoveZeroUnits: true,
            });
            return `${openPrefix}\n${minified}\n${closeSuffix}`;
          } catch {
            return match;
          }
        }
      );
    }

    // 2. Encode custom JavaScript <script> tags into XML-safe CDATA runners
    // Exclude JSON-LD and custom data templates
    const scriptRegex = /(<script\b(?![^>]*\btype=["'](?:application\/ld\+json|text\/template|text\/x-template)["'])[^>]*>)([\s\S]*?)(<\/script>)/gi;

    output = output.replace(scriptRegex, (match, openTag, jsContent, closeTag) => {
      // Clean any existing CDATA delimiters from inside the script
      let rawJs = jsContent.trim();
      rawJs = rawJs.replace(/\/\/<!\[CDATA\[/gi, '').replace(/\/\/\]\]>/gi, '');
      rawJs = rawJs.replace(/<!\[CDATA\[/gi, '').replace(/\]\]>/gi, '');
      rawJs = rawJs.trim();

      if (!rawJs) return match;

      // Encode JS to UTF-8 Base64
      const b64 = encodeUtf8ToBase64(rawJs);

      // Package in Blogger-compatible CDATA runner (prevents XML & entity parsing errors)
      const protectedRunner = `
//<![CDATA[
/* CodeGaurd Protected Blogger Script */
(function(){
  var _0xb = "${b64}";
  try {
    var _b = window.atob(_0xb), _l = _b.length, _y = new Uint8Array(_l);
    for (var i = 0; i < _l; i++) { _y[i] = _b.charCodeAt(i); }
    var _c = new TextDecoder('utf-8').decode(_y);
    (1, eval)(_c);
  } catch(e) {
    (1, eval)(decodeURIComponent(escape(window.atob(_0xb))));
  }
})();
//]]>
`;
      return `${openTag}${protectedRunner}${closeTag}`;
    });

    return output.trim();
  } else {
    // Isolated snippet or widget for Blogger
    const b64 = encodeUtf8ToBase64(trimmed);

    return `<!-- ======================================================== -->
<!-- CodeGaurd Protected Blogger Gadget / Snippet (XML Safe)   -->
<!-- ======================================================== -->
<script type='text/javascript'>
//<![CDATA[
(function() {
  var _0xdata = "${b64}";
  try {
    var _b = window.atob(_0xdata), _l = _b.length, _y = new Uint8Array(_l);
    for (var i = 0; i < _l; i++) { _y[i] = _b.charCodeAt(i); }
    var _html = new TextDecoder('utf-8').decode(_y);
    document.write(_html);
  } catch(e) {
    document.write(decodeURIComponent(escape(window.atob(_0xdata))));
  }
})();
//]]>
</script>`;
  }
}

/**
 * Restores and decodes Blogger XML templates and widgets.
 * Detects all encoded scripts (_0xb, _0xdata, etc.) inside CDATA blocks and
 * recovers the original readable code.
 */
export function restoreBloggerXml(xmlCode: string): { code: string; decodedCount: number } {
  let decodedCount = 0;
  let output = xmlCode;

  // 1. Decode scripts with _0xb (Blogger JS runner)
  const scriptRegex = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi;
  output = output.replace(scriptRegex, (match, openTag, content, closeTag) => {
    // Check for _0xb = "..."
    const bMatch = /var\s+_0xb\s*=\s*["']([A-Za-z0-9+/=]+)["']/i.exec(content);
    if (bMatch && bMatch[1]) {
      try {
        const decodedJs = decodeBase64ToUtf8(bMatch[1]);
        decodedCount++;
        return `${openTag}\n//<![CDATA[\n${decodedJs}\n//]]>\n${closeTag}`;
      } catch {
        return match;
      }
    }

    // Check for _0xdata = "..." (HTML gadget inside Blogger)
    const dataMatch = /var\s+_0xdata\s*=\s*["']([A-Za-z0-9+/=]+)["']/i.exec(content);
    if (dataMatch && dataMatch[1]) {
      try {
        const decodedHtml = decodeBase64ToUtf8(dataMatch[1]);
        decodedCount++;
        return decodedHtml;
      } catch {
        return match;
      }
    }

    return match;
  });

  return { code: output, decodedCount };
}
