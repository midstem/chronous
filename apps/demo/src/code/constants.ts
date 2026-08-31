import type { CodeTokenKind } from '../highlight'

export const COPY_LABEL = 'Copy'

export const COPIED_LABEL = 'Copied'

export const COPIED_MS = 1200

export const TOKEN_STYLES: Record<CodeTokenKind, string> = {
  plain: 'text-code-plain',
  comment: 'text-code-comment italic',
  string: 'text-code-string',
  keyword: 'text-code-keyword',
  number: 'text-code-number',
  tag: 'text-code-tag',
  attribute: 'text-code-attribute',
  function: 'text-code-function',
  punctuation: 'text-code-punctuation'
}
