import { EMPTY, KEYWORDS, ONE_CHAR } from './constants'
import type { CodeToken, CodeTokenKind, Cursor } from './types'

export const cursorOf = (source: string): Cursor => ({
  source,
  pos: 0,
  last: EMPTY,
  tokens: []
})

export const push = (
  cursor: Cursor,
  text: string,
  kind: CodeTokenKind
): void => {
  if (!text) return

  const trimmed = text.trimEnd()
  const previous: CodeToken | undefined = cursor.tokens.at(-1)

  if (trimmed) cursor.last = trimmed.slice(-ONE_CHAR)

  if (previous?.kind === kind) {
    previous.text += text

    return
  }

  cursor.tokens.push({ text, kind })
}

export const peek = (cursor: Cursor, offset = 0): string =>
  cursor.source[cursor.pos + offset] ?? EMPTY

export const starts = (cursor: Cursor, text: string): boolean =>
  cursor.source.startsWith(text, cursor.pos)

export const isDone = (cursor: Cursor): boolean =>
  cursor.pos >= cursor.source.length

export const take = (cursor: Cursor, length: number): string => {
  const text = cursor.source.slice(cursor.pos, cursor.pos + length)

  cursor.pos += text.length

  return text
}

export const read = (cursor: Cursor, pattern: RegExp): string => {
  pattern.lastIndex = cursor.pos

  const found = pattern.exec(cursor.source)

  if (!found) return EMPTY

  cursor.pos += found[0].length

  return found[0]
}

export const kindOfIdentifier = (
  cursor: Cursor,
  name: string
): CodeTokenKind => {
  if (KEYWORDS.has(name)) return 'keyword'

  return peek(cursor) === '(' ? 'function' : 'plain'
}
