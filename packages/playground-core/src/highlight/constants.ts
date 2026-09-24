export const KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'of',
  'readonly',
  'return',
  'satisfies',
  'static',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'var',
  'void',
  'while'
])

export const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr'
])

export const EMPTY = ''

export const NO_DEPTH = 0

export const ONE_CHAR = 1

export const TWO_CHARS = 2

export const WHITESPACE = /\s+/y

export const LINE_COMMENT = /\/\/[^\n]*/y

export const BLOCK_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/y

export const QUOTED = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/y

export const IDENTIFIER = /[A-Za-z_$][\w$]*/y

export const NUMBER = /\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?/iy

export const TAG_NAME = /[A-Za-z][\w.:-]*/y

export const ATTRIBUTE_NAME = /[A-Za-z_][\w.:-]*/y

export const UNQUOTED_VALUE = /[^\s>]+/y

export const MARKUP_TEXT = /[^<{}]+/y

export const AFTER_VALUE = /[\w$)\]'"`]/

export const JSX_AFTER_ANGLE = /[A-Za-z>/]/
