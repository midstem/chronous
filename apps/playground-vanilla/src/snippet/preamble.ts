import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous'
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

export const preambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  needs: Needs
): readonly string[] => [
  "import 'temporal-polyfill/global'",
  "import { buildCalendar, formatIso, calendarReducer, initialCalendarState } from '@midstem/chronous'",
  "import type { CalendarRange, EventInput, CalendarLayout, ViewKind, IsoDateTime } from '@midstem/chronous'",
  '',
  'type EventData = { title: string }',
  '',
  `const LOCALE = '${locale}'`,
  '',
  "const VIEWS: ViewKind[] = ['day', 'week', 'days', 'month', 'agenda']",
  '',
  ...(needs.clock
    ? [
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
    : []),
  'const INITIAL_RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  ''
]
