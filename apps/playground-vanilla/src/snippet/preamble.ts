import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { RANGE_INDENT } from './constants'

export const ESCAPE_HTML_SOURCE = [
  `const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => {`,
  `  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }`,
  '  return entities[char]',
  '})'
].join('\n')

export const CONTINUATION_SOURCE =
  'const edge = (continues) => continues ? "…" : ""'

export type Needs = {
  clock: boolean
  now: boolean
}

const literal = (value: unknown): string => JSON.stringify(value)

export const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

export const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(/</g, '\\u003c')

export const preambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  needs: Needs
): readonly string[] => [
  "import 'temporal-polyfill/global'",
  "import { buildCalendar, formatIso, calendarReducer, initialCalendarState } from '@midstem/chronous'",
  '',
  `const LOCALE = ${JSON.stringify(locale)}`,
  '',
  ...(needs.clock
    ? [
        'const clock = (at) => {',
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
  ...(needs.now
    ? [
        'const getNow = (timeZone) => {',
        '  try {',
        '    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone }',
        '    const parts = Object.fromEntries(',
        '      new Intl.DateTimeFormat("en-US", options)',
        '        .formatToParts(new Date())',
        '        .map(({ type, value }) => [type, value])',
        '    )',
        '    const hour = Number(parts.hour) % 24',
        '    return {',
        '      date: `${parts.year}-${parts.month}-${parts.day}`,',
        '      minuteOfDay: hour * 60 + Number(parts.minute)',
        '    }',
        '  } catch { return null }',
        '}',
        ''
      ]
    : []),
  ESCAPE_HTML_SOURCE,
  CONTINUATION_SOURCE,
  '',
  'const INITIAL_RANGE = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS = ${eventLines(events)}`,
  ''
]
