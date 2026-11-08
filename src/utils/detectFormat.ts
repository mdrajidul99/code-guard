import { CodeFormat } from '../types/index.ts';

/**
 * Automatically inspects input code to determine whether it is Blogger XML or HTML.
 */
export function detectFormat(code: string): CodeFormat {
  const trimmed = code.trim();
  if (!trimmed) return 'html';

  // 1. Check for Blogger XML markers
  const isBloggerXml =
    trimmed.includes('xmlns:b="http://www.google.com/2005/gml/b"') ||
    trimmed.includes('xmlns:b=') ||
    /<b:skin\b/i.test(trimmed) ||
    /<b:section\b/i.test(trimmed) ||
    /<b:widget\b/i.test(trimmed) ||
    /<b:includable\b/i.test(trimmed) ||
    (trimmed.startsWith('<?xml') && /<html\b/i.test(trimmed) && trimmed.includes('<data:'));

  if (isBloggerXml) {
    return 'blogger';
  }

  // 2. Default to HTML (Website & App Code)
  return 'html';
}
