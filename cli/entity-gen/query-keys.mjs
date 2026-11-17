const ENUM_START = /export\s+enum\s+QueryKeys\s*{/;

// Comments and string literals can hold commas, braces, "=" and "$" that are not enum syntax.
const COMMENTS_AND_STRINGS =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;

// Blanks out comments and fills strings with "_", keeping every character position and line
// break, so an index found in the result points at the same place in the original text. A
// string value stays visible as code, so a missing comma goes after it, not in front of it.
const mask = content =>
  content.replace(COMMENTS_AND_STRINGS, token =>
    token.replace(/[^\n]/g, /^\/[/*]/.test(token) ? ' ' : '_'),
  );

export const withQueryKeys = (content, keys) => {
  const masked = mask(content);
  const start = masked.search(ENUM_START);
  const open = start === -1 ? -1 : masked.indexOf('{', start);
  const close = open === -1 ? -1 : masked.indexOf('}', open);

  if (close === -1) {
    throw new Error(
      'src/shared/constants/query-keys.ts has no "export enum QueryKeys { … }".',
    );
  }

  const body = masked.slice(open + 1, close);
  const names = body
    .split(',')
    .map(member => member.split('=')[0].trim())
    .filter(Boolean);
  const added = keys.filter(key => !names.includes(key));

  if (added.length === 0) {
    return { added, content };
  }

  // New members go in front of the closing brace, so existing members, comments and blank
  // lines stay untouched. The last member gets a comma first if it has none.
  const lastCode = open + 1 + body.trimEnd().length;
  const needsComma = body.trim() !== '' && !body.trimEnd().endsWith(',');

  return {
    added,
    content:
      content.slice(0, lastCode) +
      (needsComma ? ',' : '') +
      content.slice(lastCode, close) +
      added.map(key => `  ${key},\n`).join('') +
      content.slice(close),
  };
};
