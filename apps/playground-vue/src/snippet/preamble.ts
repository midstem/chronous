import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous-vue'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { RANGE_INDENT } from './constants'

export type Needs = {
  clock: boolean
}

const literal = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c')

export const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

export const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(/</g, '\\u003c')

const importsOf = (needs: Needs): readonly string[] => [
  '<script setup lang="ts">',
  "import 'temporal-polyfill/global'",
  "import { ref } from 'vue'",
  "import { Calendar, formatIso, useNow } from '@midstem/chronous-vue'",
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
  'type EventData = { title?: string }',
  '',
  `const LOCALE = ${literal(locale)}`,
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
  'const today = useNow(() => range.value.timeZone)',
  ''
]
