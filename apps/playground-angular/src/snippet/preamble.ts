import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { KEY_PATTERN, KEY_REPLACEMENT, RANGE_INDENT } from './constants'

export type Needs = {
  tones: boolean
  clock: boolean
}

const literal = (value: unknown): string =>
  typeof value === 'number' ? String(value) : `'${String(value)}'`

const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(
    KEY_PATTERN,
    KEY_REPLACEMENT
  )

const importsOf = (needs: Needs): readonly string[] => [
  "import { Component, signal } from '@angular/core'",
  needs.clock
    ? "import { CALENDAR_DIRECTIVES, formatIso } from '@midstem/chronous-angular'"
    : "import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'",
  needs.clock
    ? "import type { CalendarRange, EventInput, IsoDateTime, ViewKind } from '@midstem/chronous-angular'"
    : "import type { CalendarRange, EventInput, ViewKind } from '@midstem/chronous-angular'"
]

const toneLines: readonly string[] = [
  'const TONES: readonly string[] = [',
  "  'bg-blue-600 text-white dark:bg-blue-900 dark:text-blue-100',",
  "  'bg-purple-600 text-white dark:bg-purple-900 dark:text-purple-100',",
  "  'bg-teal-600 text-white dark:bg-teal-900 dark:text-teal-100',",
  "  'bg-amber-600 text-white dark:bg-amber-900 dark:text-amber-100',",
  "  'bg-rose-600 text-white dark:bg-rose-900 dark:text-rose-100',",
  "  'bg-lime-600 text-white dark:bg-lime-900 dark:text-lime-100'",
  ']',
  '',
  'const toneOf = (id: string): string => {',
  '  let hash = 0',
  '  for (let index = 0; index < id.length; index += 1)',
  '    hash = (hash * 31 + id.charCodeAt(index)) % TONES.length',
  '  return TONES[hash]',
  '}',
  ''
]

const clockLines = (locale: LocaleId): readonly string[] => [
  `const clock = (iso: IsoDateTime): string =>`,
  `  formatIso(iso, { locale: '${locale}', options: { hour: '2-digit', minute: '2-digit' } })`,
  ''
]

export const preambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  needs: Needs
): readonly string[] => [
  ...importsOf(needs),
  '',
  'type EventData = { title: string }',
  '',
  `const LOCALE: string = '${locale}'`,
  '',
  'const INITIAL_RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  '',
  ...(needs.tones ? toneLines : []),
  ...(needs.clock ? clockLines(locale) : [])
]
