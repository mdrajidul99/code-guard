/**
 * Safe CSS Minifier that preserves CSS custom properties (var(--...)),
 * @media queries, @keyframes, calc() expressions, colors, fonts,
 * quoted strings, and url(...) values without breaking layout rules.
 */
export function minifyCss(css: string): string {
  if (!css || !css.trim()) return '';

  // Clean implementation:
  const tokens: string[] = [];
  let safe = css.replace(
    /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\s*\))/gi,
    (match) => {
      const id = `__CG_CSS_TOK_${tokens.length}__`;
      tokens.push(match);
      return id;
    }
  );

  // Strip comments (except /*!)
  safe = safe.replace(/\/\*(?!\!)[\s\S]*?\*\//g, '');

  // Collapse runs of whitespace to single space
  safe = safe.replace(/\s+/g, ' ');

  // Strip whitespace around braces, semicolons, commas
  safe = safe
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',');

  // Strip whitespace AFTER colon only (preserves descendant pseudo-selectors like ".parent :hover")
  safe = safe.replace(/:\s+/g, ':');

  // Strip trailing semicolons right before closing brace
  safe = safe.replace(/;\}/g, '}');

  // Remove empty rulesets safely (only simple non-nested empty blocks)
  safe = safe.replace(/[^{}@]+\{\}/g, '');

  // Shorten 6-digit hex colors (#ffffff -> #fff) when all 3 pairs match
  safe = safe.replace(/#([a-fA-F0-9])\1([a-fA-F0-9])\2([a-fA-F0-9])\3(?![a-fA-F0-9])/g, '#$1$2$3');

  // Restore preserved strings and url(...) values
  safe = safe.replace(/__CG_CSS_TOK_(\d+)__/g, (_, idx) => tokens[Number(idx)] ?? '');

  return safe.trim();
}

/**
 * Safely minifies plain CSS sections inside Blogger <b:skin> while keeping
 * <Variable>, <Group>, and <b:...> directives intact.
 */
export function minifyBloggerSkinWithDirectives(skinContent: string): string {
  const directives: string[] = [];
  let safe = skinContent.replace(
    /(<(?:Variable|Group|b:[a-zA-Z0-9_-]+)\b[^>]*>|<\/(?:Group|b:[a-zA-Z0-9_-]+)>)/gi,
    (match) => {
      const token = `/*__CG_B_DIR_${directives.length}__*/`;
      directives.push(match);
      return token;
    }
  );

  // Strip non-directive comments carefully (ignoring /*! and /*__CG_B_DIR_)
  safe = safe.replace(/\/\*(?!\!|__CG_B_DIR_)[\s\S]*?\*\//g, '');
  safe = safe.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();

  // Restore directives on their own clean lines
  safe = safe.replace(/\/\*__CG_B_DIR_(\d+)__\*\//g, (_, idx) => `\n${directives[Number(idx)] ?? ''}\n`);
  return safe.replace(/\n{3,}/g, '\n\n').trim();
}
