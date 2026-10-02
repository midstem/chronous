import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { RANGE_INDENT } from './constants'

const literal = (value: unknown): string => JSON.stringify(value)

const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT)

const importsOf = (needsClock: boolean): readonly string[] => [
  "import 'temporal-polyfill/global'",
  "import { Component, signal } from '@angular/core'",
  needsClock
    ? "import { CALENDAR_DIRECTIVES, formatIso, injectNow } from '@midstem/chronous-angular'"
    : "import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'",
  needsClock
    ? "import type { CalendarRange, EventInput, IsoDateTime, ViewKind } from '@midstem/chronous-angular'"
    : "import type { CalendarRange, EventInput } from '@midstem/chronous-angular'"
]

export const preambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  needsClock = true
): readonly string[] => [
  ...importsOf(needsClock),
  '',
  'type EventData = { title?: string }',
  '',
  `const LOCALE: string = ${JSON.stringify(locale)}`,
  '',
  'const INITIAL_RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  ''
]
