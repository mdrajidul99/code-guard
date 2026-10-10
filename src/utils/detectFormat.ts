import { CodeFormat } from '../types/index.ts';

/**
 * Automatically inspects input code to determine the most likely format.
 */
export function detectFormat(code: string): 'html' | 'javascript' | 'css' | 'blogger' {
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

  // 2. Check for standard HTML
  const isHtml =
    /^<!doctype\s+html/i.test(trimmed) ||
    /<html\b/i.test(trimmed) ||
    (/<head\b/i.test(trimmed) && /<body\b/i.test(trimmed)) ||
    (/<div\b/i.test(trimmed) && /<\/div>/i.test(trimmed)) ||
    (/<script\b/i.test(trimmed) && /<style\b/i.test(trimmed));

  if (isHtml) {
    return 'html';
  }

  // 3. Check for CSS
  // CSS typically has rules with curly braces, selectors, properties with colons, @media, @keyframes
  const hasCssSelectors = /^[.#a-zA-Z0-9_\-\s:,>+~*\[\]="'^$*|]+\s*\{[^}]*\}/m.test(trimmed);
  const hasCssAtRules = /@(media|keyframes|import|charset|supports|font-face)\b/i.test(trimmed);
  const hasHtmlTags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/i.test(trimmed);

  if (!hasHtmlTags && (hasCssAtRules || (hasCssSelectors && !trimmed.includes('function') && !trimmed.includes('const ') && !trimmed.includes('var ')))) {
    return 'css';
  }

  // 4. Default to JavaScript if code contains JS keywords or syntax
  const isJs =
    /\b(function|const|let|var|class|import|export|return|async|await|console\.|window\.|document\.)\b/.test(trimmed) ||
    /=>/.test(trimmed);

  if (isJs) {
    return 'javascript';
  }

  // Fallback heuristic: if it contains '<' and '>', it's likely markup (HTML)
  if (trimmed.includes('<') && trimmed.includes('>')) {
    return 'html';
  }

  return 'javascript';
}
