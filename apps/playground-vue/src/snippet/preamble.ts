import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous-vue'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { KEY_PATTERN, KEY_REPLACEMENT, RANGE_INDENT } from './constants'

export type Needs = {
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
