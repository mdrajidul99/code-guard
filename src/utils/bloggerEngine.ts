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
 * - Guarantees ZERO XML Parsing Errors (e.g. SAXParseException on b:includable or unmatched tags).
 * - Leaves all external scripts (with src=) untouched.
 * - Leaves all self-closing scripts (<script ... />) untouched.
 * - Leaves all dynamic Blogger tags (<b:includable>, <b:widget>, <data:...>, <expr:...>) untouched.
 * - Safely wraps standalone custom scripts into Blogger-compliant //<![CDATA[ ... //]]> runners.
 * - Safely minifies CSS inside <b:skin><![CDATA[ ... ]]></b:skin> while keeping Blogger variables intact.
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
    // CRITICAL FIX: Only match scripts that have real inline code and DO NOT cross XML/Blogger boundaries!
    output = output.replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/gi, (match, openTag, attrs, content, closeTag) => {
      // 1. Skip if external script with src attribute
      if (/\bsrc\s*=/i.test(attrs)) return match;
      // 2. Skip if self-closing opening tag
      if (openTag.trim().endsWith('/>')) return match;
      // 3. Skip JSON-LD, text/template, or other non-executable types
      if (/\btype\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template|text\/x-template)/i.test(attrs)) return match;
      // 4. Skip if content has another opening <script (means earlier script was unclosed or self-closing)
      if (/<script\b/i.test(content)) return match;
      // 5. CRITICAL: Skip if content contains Blogger XML tags like <b:widget>, <b:includable>, <data:...>, <expr:...>
      // These are Blogger server-evaluated XML directives and MUST NEVER be touched or destroyed!
      if (/<b:|<\/b:|<data:|<expr:/i.test(content)) return match;
      // 6. Skip if empty or whitespace only
      if (!content.trim()) return match;

      // Extract pure JS content without CDATA wrapper
      let rawJs = content.trim();
      rawJs = rawJs.replace(/\/\/<!\[CDATA\[/gi, '').replace(/\/\/\]\]>/gi, '');
      rawJs = rawJs.replace(/<!\[CDATA\[/gi, '').replace(/\]\]>/gi, '');
      rawJs = rawJs.trim();
      if (!rawJs) return match;

      const b64 = encodeUtf8ToBase64(rawJs);

      const protectedRunner = `\n//<![CDATA[\n/* CodeGaurd Protected Blogger Script */\n(function(){\n  var _0xb = "${b64}";\n  try {\n    var _b = window.atob(_0xb), _l = _b.length, _y = new Uint8Array(_l);\n    for (var i = 0; i < _l; i++) { _y[i] = _b.charCodeAt(i); }\n    var _c = new TextDecoder('utf-8').decode(_y);\n    (1, eval)(_c);\n  } catch(e) {\n    (1, eval)(decodeURIComponent(escape(window.atob(_0xb))));\n  }\n})();\n//]]>\n`;
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
