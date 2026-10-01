import { describe, expect, it } from 'vitest'

import { highlight } from '../index'
import type { CodeToken, CodeTokenKind } from '../index'

const SOURCE = `import { createCalendarComponents } from '@midstem/chronous'

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
    expect(kindOf(tokens, "'@midstem/chronous'")).toBe('string')
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

  it('highlights script and template sections in Vue single-file components', () => {
    const source = `<script setup lang="ts">\nconst title = 'Board'\n</script>\n<template><button class="action" @click="save">{{ title }}</button></template>`
    const tokens = highlight(source, 'vue')

    expect(sourceOf(tokens)).toBe(source)
    expect(kindOf(tokens, 'const')).toBe('keyword')
    expect(kindOf(tokens, 'template')).toBe('tag')
    expect(kindOf(tokens, 'class')).toBe('attribute')
    expect(kindOf(tokens, '"action"')).toBe('string')
  })

  it('highlights script and template sections in Svelte components', () => {
    const source = `<script lang="ts">\nlet count = 1\n</script>\n<button on:click={increment()}>{count}</button>`
    const tokens = highlight(source, 'svelte')

    expect(sourceOf(tokens)).toBe(source)
    expect(kindOf(tokens, 'let')).toBe('keyword')
    expect(kindOf(tokens, 'button')).toBe('tag')
    expect(kindOf(tokens, 'on:click')).toBe('attribute')
    expect(kindOf(tokens, 'increment')).toBe('function')
    expect(kindOf(tokens, 'count')).toBe('plain')
  })

  it('highlights Angular inline template markup while preserving TypeScript strings', () => {
    const source = `const label = 'Board'\n@Component({\n  template: \`<button class="action">{{ label }}</button>\`\n})`
    const tokens = highlight(source)

    expect(sourceOf(tokens)).toBe(source)
    expect(kindOf(tokens, 'const')).toBe('keyword')
    expect(kindOf(tokens, "'Board'")).toBe('string')
    expect(kindOf(tokens, 'button')).toBe('tag')
    expect(kindOf(tokens, 'class')).toBe('attribute')
    expect(kindOf(tokens, '"action"')).toBe('string')
  })

  it('does not end an Angular inline template at an escaped backtick', () => {
    const source = 'template: `text \\`<span>still in template</span>`'
    const tokens = highlight(source)

    expect(sourceOf(tokens)).toBe(source)
    expect(kindOf(tokens, 'span')).toBe('tag')
  })

  it('highlights Angular binding attribute names and their quoted values', () => {
    const source = `template: \`<button [value]="range" (click)="save()" *chronousFor="items"></button>\``
    const tokens = highlight(source)

    expect(sourceOf(tokens)).toBe(source)
    expect(kindOf(tokens, '[value]')).toBe('attribute')
    expect(kindOf(tokens, '(click)')).toBe('attribute')
    expect(kindOf(tokens, '*chronousFor')).toBe('attribute')
    expect(kindOf(tokens, '"range"')).toBe('string')
    expect(kindOf(tokens, '"save()"')).toBe('string')
    expect(kindOf(tokens, '"items"')).toBe('string')
  })

  it('highlights Svelte shorthand attributes as expressions', () => {
    const source = `<Widget {range} />`
    const tokens = highlight(source, 'svelte')

    expect(sourceOf(tokens)).toBe(source)
    expect(kindOf(tokens, 'Widget')).toBe('tag')
    expect(kindOf(tokens, 'range')).toBe('plain')
  })
})
