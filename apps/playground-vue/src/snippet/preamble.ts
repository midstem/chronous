import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous-vue'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { KEY_PATTERN, KEY_REPLACEMENT, RANGE_INDENT } from './constants'

export type Needs = {
  tones: boolean
  clock: boolean
}

const literal = (value: unknown): string =>
  typeof value === 'number' ? String(value) : `'${String(value)}'`

export const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

export const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(
    KEY_PATTERN,
    KEY_REPLACEMENT
  )

const importsOf = (needs: Needs): readonly string[] => [
  '<script setup lang="ts">',
  "import { ref } from 'vue'",
  needs.clock
    ? "import { Calendar, createCalendarComponents, formatIso } from '@midstem/chronous-vue'"
    : "import { Calendar, createCalendarComponents } from '@midstem/chronous-vue'",
  needs.clock
    ? "import type { CalendarRange, EventInput, IsoDateTime, ViewKind } from '@midstem/chronous-vue'"
    : "import type { CalendarRange, EventInput, ViewKind } from '@midstem/chronous-vue'"
]

const TONES: readonly string[] = [
  'const TONES = [',
  "  'bg-blue-700 text-white dark:bg-blue-900 dark:text-blue-100',",
  "  'bg-violet-700 text-white dark:bg-violet-900 dark:text-violet-100',",
  "  'bg-teal-700 text-white dark:bg-teal-900 dark:text-teal-100',",
  "  'bg-amber-700 text-white dark:bg-amber-900 dark:text-amber-100',",
  "  'bg-rose-700 text-white dark:bg-rose-900 dark:text-rose-100',",
  "  'bg-lime-800 text-white dark:bg-lime-900 dark:text-lime-100'",
  ']',
  '',
  'const toneOf = (id: string): string => {',
  '  let hash = 7',
  '',
  '  for (let index = 0; index < id.length; index += 1)',
  '    hash = (hash * 31 + id.charCodeAt(index)) % TONES.length',
  '',
  '  return TONES[hash]',
  '}',
  ''
]

const CLOCK: readonly string[] = [
  'const clock = (at: IsoDateTime): string => {',
  '  try {',
  '    return formatIso(at, {',
  '      locale: LOCALE,',
  "      options: { hour: '2-digit', minute: '2-digit' }",
  '    })',
  '  } catch {',
  '    return at',
  '  }',
  '}',
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
  'const Calendar = createCalendarComponents<EventData>()',
  '',
  `const LOCALE = '${locale}'`,
  '',
  "const VIEWS: ViewKind[] = ['day', 'week', 'days', 'month', 'agenda']",
  '',
  ...(needs.tones ? TONES : []),
  ...(needs.clock ? CLOCK : []),
  'const INITIAL_RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  '',
  'const range = ref<CalendarRange>(INITIAL_RANGE)',
  '</script>',
  ''
]
