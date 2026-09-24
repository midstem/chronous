import { describe, expect, it } from 'vitest'

import { highlight } from '../index'
import type { CodeToken, CodeTokenKind } from '../index'

const SOURCE = `import { createCalendarComponents } from '@midstem/chronous-react'

const Calendar = createCalendarComponents<EventData>()

// the board
export const Board = () => (
  <Calendar.Root range={RANGE} events={EVENTS} gutterWidth="66px">
    <Calendar.TimeGrid hourHeight={60}>
      {({ dayHeight }) => \`\${dayHeight}px\`}
    </Calendar.TimeGrid>
    <br />
  </Calendar.Root>
)`

const sourceOf = (tokens: readonly CodeToken[]): string =>
  tokens.map(({ text }) => text).join('')

const kindOf = (
  tokens: readonly CodeToken[],
  text: string
): CodeTokenKind | undefined =>
  tokens.find((token) => token.text.trim() === text)?.kind

describe('highlight', () => {
  it('gives the source back unchanged', () => {
    expect(sourceOf(highlight(SOURCE))).toBe(SOURCE)
  })

  it('reads keywords, strings and comments', () => {
    const tokens = highlight(SOURCE)

    expect(kindOf(tokens, 'import')).toBe('keyword')
    expect(kindOf(tokens, 'const')).toBe('keyword')
    expect(kindOf(tokens, "'@midstem/chronous-react'")).toBe('string')
    expect(kindOf(tokens, '// the board')).toBe('comment')
  })

  it('reads a call as a function and a bare name as plain', () => {
    const tokens = highlight('const at = formatIso(day.date)')

    expect(kindOf(tokens, 'formatIso')).toBe('function')
    expect(kindOf(tokens, 'at')).toBe('plain')
  })

  it('reads a namespaced tag and its attributes', () => {
    const tokens = highlight(SOURCE)

    expect(kindOf(tokens, 'Calendar.Root')).toBe('tag')
    expect(kindOf(tokens, 'range')).toBe('attribute')
    expect(kindOf(tokens, 'gutterWidth')).toBe('attribute')
    expect(kindOf(tokens, '"66px"')).toBe('string')
  })

  it('reads a number inside an attribute expression', () => {
    expect(kindOf(highlight(SOURCE), '60')).toBe('number')
  })

  it('walks back out of a self-closing tag', () => {
    expect(kindOf(highlight(SOURCE), 'br')).toBe('tag')
  })

  it('keeps a template literal a string and reads its holes', () => {
    const tokens = highlight('const a = `${size}px`')

    expect(kindOf(tokens, 'px`')).toBe('string')
    expect(kindOf(tokens, 'size')).toBe('plain')
  })

  it('does not read a comparison as a tag', () => {
    expect(kindOf(highlight('const wide = size < limit'), '<')).toBe(
      'punctuation'
    )
  })

  it('leaves an unterminated block comment as a comment', () => {
    expect(kindOf(highlight('/* open'), '/* open')).toBe('comment')
  })
})
