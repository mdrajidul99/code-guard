import { SecureOptions } from '../types/index.ts';
import { minifyCss } from './cssEngine.ts';

/**
 * Validates whether the given string is valid XML structure.
 * Returns null if valid, or an error string if invalid.
 */
export function validateBloggerXml(xmlString: string): string | null {
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
 * Processes Blogger XML templates with strict format-safe preservation of XML declarations,
 * Blogger namespaces, CDATA blocks, widgets, includables, and expressions.
 */
export function processBloggerXml(xmlCode: string, options: Partial<SecureOptions> = {}): string {
  // 1. XML Validation
  if (options.bloggerValidateXml !== false) {
    const validationError = validateBloggerXml(xmlCode);
    if (validationError) {
      throw new Error(`Blogger XML validation failed: ${validationError}. Please check syntax or download a backup.`);
    }
  }

  let output = xmlCode;

  // 2. Minify CSS inside <b:skin><![CDATA[ ... ]]></b:skin> if enabled
  if (options.bloggerMinifyCdataCss !== false) {
    output = output.replace(
      /(<b:skin\b[^>]*>\s*<!\[CDATA\[)([\s\S]*?)(\]\]>\s*<\/b:skin>)/gi,
      (match, openPrefix, cssContent, closeSuffix) => {
        try {
          const minified = minifyCss(cssContent, {
            cssMinifyWhitespace: true,
            cssRemoveComments: false, // Keep Blogger variable definitions if needed
            cssShortenHexColors: true,
            cssRemoveZeroUnits: true,
          });
          return `${openPrefix}\n${minified}\n${closeSuffix}`;
        } catch {
          return match;
        }
      }
    );

    output = output.replace(
      /(<b:template-skin\b[^>]*>\s*<!\[CDATA\[)([\s\S]*?)(\]\]>\s*<\/b:template-skin>)/gi,
      (match, openPrefix, cssContent, closeSuffix) => {
        try {
          const minified = minifyCss(cssContent, {
            cssMinifyWhitespace: true,
            cssRemoveComments: false,
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

  // 3. Preserve CDATA blocks from regular whitespace mangling
  const cdataBlocks: string[] = [];
  output = output.replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, (match) => {
    const token = `__BLOGGER_CDATA_${cdataBlocks.length}__`;
    cdataBlocks.push(match);
    return token;
  });

  // 4. Safe whitespace optimization outside CDATA
  if (options.bloggerMinifyWhitespace !== false) {
    // Preserve line breaks around critical Blogger tags for debugging, but collapse excessive blanks
    output = output
      .replace(/>\s{2,}</g, '>\n<')
      .replace(/^[ \t]+/gm, '')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{2,}/g, '\n');
  }

  // 5. Restore CDATA blocks
  cdataBlocks.forEach((block, index) => {
    output = output.replace(`__BLOGGER_CDATA_${index}__`, block);
  });

  return output.trim();
}
