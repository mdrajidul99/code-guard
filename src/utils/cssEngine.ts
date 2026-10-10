import { SecureOptions } from '../types/index.ts';

/**
 * Minifies CSS source code safely in the browser.
 */
export function minifyCss(css: string, options: Partial<SecureOptions> = {}): string {
  let output = css;

  // 1. Remove comments
  if (options.cssRemoveComments !== false) {
    // Preserve special comment if starts with /*!
    output = output.replace(/\/\*(?!\!)([\s\S]*?)\*\//g, '');
  }

  // 2. Remove unnecessary whitespace
  if (options.cssMinifyWhitespace !== false) {
    // Collapse multiple whitespace
    output = output.replace(/\s+/g, ' ');

    // Remove whitespace around colons, semicolons, brackets, braces, commas
    output = output.replace(/\s*([{}:;,>+~])\s*/g, '$1');

    // Remove trailing semicolons in declarations
    output = output.replace(/;}/g, '}');

    // Remove empty rulesets
    output = output.replace(/[^{}]+\{\}/g, '');
  }

  // 3. Shorten hex colors (#ffffff -> #fff)
  if (options.cssShortenHexColors !== false) {
    output = output.replace(/#([a-fA-F0-9])\1([a-fA-F0-9])\2([a-fA-F0-9])\3\b/g, '#$1$2$3');
  }

  // 4. Remove zero units (0px -> 0)
  if (options.cssRemoveZeroUnits !== false) {
    output = output.replace(/(^|[ :])0(px|em|rem|%|in|cm|mm|pt|pc)\b/gi, '$10');
  }

  return output.trim();
}

/**
 * Beautifies / Formats CSS source code for maximum human readability.
 */
export function beautifyCss(css: string, indentSize = 2): string {
  const indent = ' '.repeat(indentSize);
  let formatted = '';
  let level = 0;

  // Clean raw CSS
  const cleaned = css
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/\s*\}\s*/g, '\n}\n')
    .replace(/\s*;\s*/g, ';\n')
    .replace(/\s*,\s*/g, ', ');

  const lines = cleaned.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('}')) {
      level = Math.max(0, level - 1);
    }

    const currentIndent = indent.repeat(level);

    if (line.includes('{')) {
      formatted += (formatted.length > 0 && !formatted.endsWith('\n\n') ? '\n' : '') + currentIndent + line + '\n';
      level++;
    } else if (line === '}') {
      formatted += currentIndent + line + '\n';
    } else {
      formatted += currentIndent + line + '\n';
    }
  }

  return formatted.trim();
}
