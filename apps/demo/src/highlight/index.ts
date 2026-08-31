import {
  AFTER_VALUE,
  ATTRIBUTE_NAME,
  BLOCK_COMMENT,
  EMPTY,
  IDENTIFIER,
  JSX_AFTER_ANGLE,
  LINE_COMMENT,
  MARKUP_TEXT,
  NO_DEPTH,
  NUMBER,
  ONE_CHAR,
  QUOTED,
  TAG_NAME,
  TWO_CHARS,
  UNQUOTED_VALUE,
  VOID_TAGS,
  WHITESPACE
} from './constants'
import {
  cursorOf,
  isDone,
  kindOfIdentifier,
  peek,
  push,
  read,
  starts,
  take
} from './helpers'
import type { CodeStop, CodeToken, Cursor } from './types'

const opensElement = (cursor: Cursor): boolean =>
  JSX_AFTER_ANGLE.test(peek(cursor, ONE_CHAR)) && !AFTER_VALUE.test(cursor.last)

const readTemplate = (cursor: Cursor): void => {
  push(cursor, take(cursor, ONE_CHAR), 'string')

  let text = EMPTY

  while (!isDone(cursor)) {
    const char = peek(cursor)

    if (char === '\\') {
      text += take(cursor, TWO_CHARS)
      continue
    }

    if (char === '`') {
      text += take(cursor, ONE_CHAR)
      break
    }

    if (char === '$' && peek(cursor, ONE_CHAR) === '{') {
      push(cursor, text, 'string')
      push(cursor, take(cursor, TWO_CHARS), 'punctuation')

      text = EMPTY

      readCode(cursor, 'brace')

      if (peek(cursor) === '}')
        push(cursor, take(cursor, ONE_CHAR), 'punctuation')

      continue
    }

    text += take(cursor, ONE_CHAR)
  }

  push(cursor, text, 'string')
}

const readExpression = (cursor: Cursor): void => {
  push(cursor, take(cursor, ONE_CHAR), 'punctuation')

  readCode(cursor, 'brace')

  if (peek(cursor) === '}') push(cursor, take(cursor, ONE_CHAR), 'punctuation')
}

const readClosingTag = (cursor: Cursor): void => {
  if (!starts(cursor, '</')) return

  push(cursor, take(cursor, TWO_CHARS), 'punctuation')
  push(cursor, read(cursor, TAG_NAME), 'tag')
  push(cursor, read(cursor, WHITESPACE), 'plain')

  if (peek(cursor) === '>') push(cursor, take(cursor, ONE_CHAR), 'punctuation')
}

const readAttributes = (cursor: Cursor): boolean => {
  while (!isDone(cursor)) {
    push(cursor, read(cursor, WHITESPACE), 'plain')

    if (starts(cursor, '/>')) {
      push(cursor, take(cursor, TWO_CHARS), 'punctuation')

      return true
    }

    if (peek(cursor) === '>') {
      push(cursor, take(cursor, ONE_CHAR), 'punctuation')

      return false
    }

    if (peek(cursor) === '{') {
      readExpression(cursor)
      continue
    }

    const name = read(cursor, ATTRIBUTE_NAME)

    if (!name) {
      push(cursor, take(cursor, ONE_CHAR), 'plain')
      continue
    }

    push(cursor, name, 'attribute')

    if (peek(cursor) !== '=') continue

    push(cursor, take(cursor, ONE_CHAR), 'punctuation')

    if (peek(cursor) === '{') {
      readExpression(cursor)
      continue
    }

    push(cursor, read(cursor, QUOTED) || read(cursor, UNQUOTED_VALUE), 'string')
  }

  return false
}

const readElement = (cursor: Cursor): void => {
  push(cursor, take(cursor, ONE_CHAR), 'punctuation')

  const name = read(cursor, TAG_NAME)

  push(cursor, name, 'tag')

  if (readAttributes(cursor) || VOID_TAGS.has(name.toLowerCase())) return

  readChildren(cursor)
  readClosingTag(cursor)
}

const readChildren = (cursor: Cursor): void => {
  while (!isDone(cursor)) {
    const char = peek(cursor)

    if (char === '<') {
      if (peek(cursor, ONE_CHAR) === '/') return

      readElement(cursor)
      continue
    }

    if (char === '{') {
      readExpression(cursor)
      continue
    }

    push(cursor, read(cursor, MARKUP_TEXT) || take(cursor, ONE_CHAR), 'plain')
  }
}

const readCode = (cursor: Cursor, stop: CodeStop = 'none'): void => {
  let braces = NO_DEPTH

  while (!isDone(cursor)) {
    const char = peek(cursor)

    if (char === '}') {
      if (braces === NO_DEPTH && stop === 'brace') return

      braces -= ONE_CHAR
      push(cursor, take(cursor, ONE_CHAR), 'punctuation')
      continue
    }

    if (char === '{') {
      braces += ONE_CHAR
      push(cursor, take(cursor, ONE_CHAR), 'punctuation')
      continue
    }

    const spaces = read(cursor, WHITESPACE)

    if (spaces) {
      push(cursor, spaces, 'plain')
      continue
    }

    if (starts(cursor, '//')) {
      push(cursor, read(cursor, LINE_COMMENT), 'comment')
      continue
    }

    if (starts(cursor, '/*')) {
      push(cursor, read(cursor, BLOCK_COMMENT), 'comment')
      continue
    }

    const quoted = read(cursor, QUOTED)

    if (quoted) {
      push(cursor, quoted, 'string')
      continue
    }

    if (char === '`') {
      readTemplate(cursor)
      continue
    }

    if (char === '<' && opensElement(cursor)) {
      readElement(cursor)
      continue
    }

    const number = read(cursor, NUMBER)

    if (number) {
      push(cursor, number, 'number')
      continue
    }

    const identifier = read(cursor, IDENTIFIER)

    if (identifier) {
      push(cursor, identifier, kindOfIdentifier(cursor, identifier))
      continue
    }

    push(cursor, take(cursor, ONE_CHAR), 'punctuation')
  }
}

export const highlight = (source: string): CodeToken[] => {
  const cursor = cursorOf(source)

  readCode(cursor)

  return cursor.tokens
}

export type * from './types'
