import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'

import { JSON_INDENT } from '../constants'
import type { EventData } from '../types'

import { RANGE_INDENT } from './constants'

export type Needs = {
  clock: boolean
  today: boolean
}

const literal = (value: unknown): string => JSON.stringify(value)

const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT)

const importsOf = (needs: Needs): readonly string[] => [
  "import 'temporal-polyfill/global'",
  needs.clock
    ? "import { createCalendarComponents, formatIso } from '@midstem/chronous-react'"
    : "import { createCalendarComponents } from '@midstem/chronous-react'",
  needs.clock
    ? "import type { CalendarRange, EventInput, IsoDateTime } from '@midstem/chronous-react'"
    : "import type { CalendarRange, EventInput } from '@midstem/chronous-react'",
  "import { useState } from 'react'",
  ...(needs.today ? ["import { useNow } from '@midstem/chronous-react'"] : [])
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
  'const Calendar = createCalendarComponents<EventData>()',
  '',
  `const LOCALE = ${JSON.stringify(locale)}`,
  '',
  ...(needs.clock ? CLOCK : []),
  'const INITIAL_RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  ''
]
