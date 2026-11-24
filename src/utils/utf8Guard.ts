import { parse, type Node } from 'acorn';

const NON_ASCII_RE = /[^\x00-\x7F]/;

export const CG_U8_HELPER =
  "var _cgU8=function(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new TextDecoder('utf-8').decode(a);};";

interface TextReplacement {
  start: number;
  end: number;
  text: string;
}

interface AstNodeLike extends Node {
  [key: string]: unknown;
}

/**
 * Encodes any UTF-8 string (including Bengali letters, conjuncts, vowel signs, and emojis)
 * into pure ASCII Base64 using TextEncoder.
 */
export function utf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

/**
 * Decodes pure ASCII Base64 back into UTF-8 string using TextDecoder.
 */
export function base64ToUtf8(b64: string): string | null {
  try {
    const clean = b64.trim().replace(/\s+/g, '');
    if (!clean || !/^[A-Za-z0-9+/=]+$/.test(clean)) return null;
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

function parseJsAst(code: string): AstNodeLike | null {
  const preferModule = /^\s*(?:import|export)\b/m.test(code);
  const order: Array<'module' | 'script'> = preferModule
    ? ['module', 'script']
    : ['script', 'module'];

  for (const sourceType of order) {
    try {
      return parse(code, {
        ecmaVersion: 'latest',
        sourceType,
        allowReturnOutsideFunction: sourceType === 'script',
      }) as unknown as AstNodeLike;
    } catch {
      // Try next sourceType
    }
  }
  return null;
}

function isAstNode(value: unknown): value is AstNodeLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string' &&
    typeof (value as { start?: unknown }).start === 'number' &&
    typeof (value as { end?: unknown }).end === 'number'
  );
}

function shouldSkipStringLiteral(node: AstNodeLike, parent: AstNodeLike | null): boolean {
  if (!parent) return false;
  const pType = parent.type;

  // Do not break non-computed object keys / destructuring keys ({ "বাংলা": 1 })
  if (pType === 'Property' && parent.key === node && !parent.computed) {
    return true;
  }
  // Do not break class method/field literal keys
  if (
    (pType === 'MethodDefinition' || pType === 'PropertyDefinition') &&
    parent.key === node &&
    !parent.computed
  ) {
    return true;
  }
  // Do not break static import/export module specifiers
  if (
    (pType === 'ImportDeclaration' ||
      pType === 'ExportNamedDeclaration' ||
      pType === 'ExportAllDeclaration') &&
    parent.source === node
  ) {
    return true;
  }
  if (pType === 'ImportSpecifier' || pType === 'ExportSpecifier' || pType === 'ImportAttribute') {
    return true;
  }
  // Do not break directive prologues ('use strict')
  if (pType === 'ExpressionStatement' && typeof parent.directive === 'string') {
    return true;
  }

  return false;
}

/**
 * AST-based preprocessor run strictly BEFORE javascript-obfuscator.
 * Replaces every non-ASCII string Literal and TemplateLiteral static quasi
 * with `_cgU8("PURE_ASCII_UTF8_BASE64")` without breaking object keys,
 * regex literals, or `${...}` expressions, and prepends the ES5 `_cgU8`
 * decoder helper only if at least one non-ASCII string was protected.
 */
export function protectNonAsciiWithUtf8Helper(code: string): string {
  if (!code || !code.trim()) return code;

  // Quick check: raw non-ASCII chars OR \uXXXX / \u{...} / \xXX escapes in source
  const mightContainNonAscii = NON_ASCII_RE.test(code) || /\\u[0-9a-fA-F{]|\\x[89a-fA-F]/.test(code);
  if (!mightContainNonAscii) return code;

  const ast = parseJsAst(code);
  if (!ast) return code;

  const replacements: TextReplacement[] = [];

  const visit = (node: AstNodeLike, parent: AstNodeLike | null): void => {
    if (node.type === 'Literal') {
      // Skip RegExp literals and non-string literals
      if (node.regex || typeof node.value !== 'string') return;
      if (shouldSkipStringLiteral(node, parent)) return;
      if (NON_ASCII_RE.test(node.value)) {
        const b64 = utf8ToBase64(node.value);
        replacements.push({
          start: node.start,
          end: node.end,
          text: `_cgU8("${b64}")`,
        });
      }
      return;
    }

    if (node.type === 'TemplateLiteral') {
      const isTagged = parent?.type === 'TaggedTemplateExpression' && parent.quasi === node;
      const quasis = Array.isArray(node.quasis) ? (node.quasis as AstNodeLike[]) : [];
      const expressions = Array.isArray(node.expressions) ? (node.expressions as AstNodeLike[]) : [];

      if (!isTagged) {
        if (expressions.length === 0 && quasis.length === 1) {
          const valObj = quasis[0].value as { cooked?: string | null; raw?: string } | undefined;
          const strVal = valObj?.cooked ?? valObj?.raw ?? '';
          if (NON_ASCII_RE.test(strVal)) {
            const b64 = utf8ToBase64(strVal);
            replacements.push({
              start: node.start,
              end: node.end,
              text: `_cgU8("${b64}")`,
            });
            return;
          }
        } else {
          for (const quasi of quasis) {
            const valObj = quasi.value as { cooked?: string | null; raw?: string } | undefined;
            const strVal = valObj?.cooked ?? valObj?.raw ?? '';
            if (strVal && NON_ASCII_RE.test(strVal)) {
              const b64 = utf8ToBase64(strVal);
              replacements.push({
                start: quasi.start,
                end: quasi.end,
                text: `\${_cgU8("${b64}")}`,
              });
            }
          }
        }
      }

      // Always traverse inside ${...} expressions cleanly
      for (const expr of expressions) {
        if (isAstNode(expr)) {
          visit(expr, node);
        }
      }
      return;
    }

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') {
        continue;
      }
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (isAstNode(item)) {
            visit(item, node);
          }
        }
      } else if (isAstNode(child)) {
        visit(child, node);
      }
    }
  };

  visit(ast, null);

  if (replacements.length === 0) {
    return code;
  }

  // Apply replacements from end to start so offsets stay exact
  replacements.sort((a, b) => b.start - a.start);
  let out = code;
  for (const rep of replacements) {
    out = out.slice(0, rep.start) + rep.text + out.slice(rep.end);
  }

  // Avoid duplicate helper insertion if code already defines _cgU8
  if (/\b_cgU8\s*=/.test(out)) {
    return out;
  }

  // Preserve leading 'use strict'; directive prologue if present
  const body = Array.isArray(ast.body) ? (ast.body as AstNodeLike[]) : [];
  if (body.length > 0 && body[0].type === 'ExpressionStatement' && typeof body[0].directive === 'string') {
    const directiveEnd = body[0].end;
    // Note: directive was skipped during replacements, so its end offset is unchanged
    return `${out.slice(0, directiveEnd)}\n${CG_U8_HELPER}\n${out.slice(directiveEnd)}`;
  }

  return `${CG_U8_HELPER}\n${out}`;
}

/**
 * Restores `_cgU8("BASE64")` calls back into clean UTF-8 JavaScript string literals
 * and cleans up the `_cgU8` helper declaration when no calls remain.
 */
export function decodeUtf8HelperCalls(code: string): { result: string; count: number } {
  if (!code || !code.includes('_cgU8')) {
    return { result: code, count: 0 };
  }

  let count = 0;
  let result = code.replace(
    /\b_cgU8\s*\(\s*(['"])([A-Za-z0-9+/=\s]+)\1\s*\)/g,
    (match, _q, b64) => {
      const decoded = base64ToUtf8(b64);
      if (decoded !== null) {
        count++;
        return JSON.stringify(decoded);
      }
      return match;
    }
  );

  // Strip unused _cgU8 helper declaration cleanly
  if (count > 0 && !/\b_cgU8\s*\(/.test(result)) {
    result = result.replace(
      /(?:var|let|const)\s+_cgU8\s*=\s*function\s*\(\s*s\s*\)\s*\{[\s\S]{0,300}?TextDecoder\s*\(\s*['"]utf-8['"]\s*\)\.decode\s*\([^)]*\)\s*;?\s*\}\s*;?\s*/g,
      ''
    );
  }

  return { result, count };
}
