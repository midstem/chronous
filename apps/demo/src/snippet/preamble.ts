import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'

import { JSON_INDENT } from '../constants'
import type { EventData } from '../types'

import { KEY_PATTERN, KEY_REPLACEMENT, SPEC_INDENT } from './constants'

const literal = (value: unknown): string =>
  typeof value === 'number' ? String(value) : `'${String(value)}'`

const specLines = (spec: RangeSpec): string =>
  Object.entries(spec)
    .map(([key, value]) => `${SPEC_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(
    KEY_PATTERN,
    KEY_REPLACEMENT
  )

export const preambleOf = (
  spec: RangeSpec,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  slotted: boolean
): readonly string[] => [
  "import { formatIso } from '@midstem/chronous'",
  'import type {',
  '  Calendar as CalendarData,',
  '  EventInput,',
  '  FormatOptions,',
  '  IsoDate,',
  '  IsoDateTime,',
  '  RangeSpec,',
  '  ViewKind',
  "} from '@midstem/chronous'",
  "import { useCalendar, useCalendarNavigation } from '@midstem/chronous-react'",
  slotted
    ? "import { useEffect, useRef, useState } from 'react'"
    : "import { useState } from 'react'",
  '',
  'type EventData = { title: string }',
  '',
  `const LOCALE = '${locale}'`,
  '',
  "const VIEWS: ViewKind[] = ['day', 'week', 'days', 'month', 'agenda']",
  '',
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
  '',
  'const INITIAL_SPEC: RangeSpec = {',
  specLines(spec),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  '',
  'const label = (at: IsoDateTime | IsoDate, options: FormatOptions): string => {',
  '  try {',
  '    return formatIso(at, { locale: LOCALE, options })',
  '  } catch {',
  '    return at',
  '  }',
  '}',
  '',
  'const titleOf = (calendar: CalendarData<EventData>): string => {',
  '  const days = calendar.days',
  '  const anchor = (days.find((day) => day.inPeriod) ?? days[0]).date',
  '',
  "  if (calendar.view === 'day')",
  "    return label(anchor, { day: 'numeric', month: 'long', year: 'numeric' })",
  '',
  "  if (calendar.view === 'month')",
  "    return label(anchor, { month: 'long', year: 'numeric' })",
  '',
  "  return `${label(days[0].date, { day: 'numeric', month: 'short' })} – ${label(days[days.length - 1].date, { day: 'numeric', month: 'long', year: 'numeric' })}`",
  '}',
  ''
]
