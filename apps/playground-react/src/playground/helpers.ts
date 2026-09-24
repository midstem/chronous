import type {
  Disambiguation,
  EventInput,
  CalendarRange,
  WeekStartsOn
} from '@midstem/chronous-react'

import { JSON_INDENT, UNSET } from '../constants'
import type { EventData } from '../types'

import {
  EVENTS_NOT_AN_ARRAY,
  eventNotAnObject,
  eventWithoutId,
  eventWithoutStart
} from './constants'
import type { ParseResult, PlaygroundState } from './types'

const optional = <TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined
): Partial<Record<TKey, TValue>> =>
  value === undefined ? {} : ({ [key]: value } as Record<TKey, TValue>)

const numberOf = (value: string): number | undefined =>
  value.trim() === UNSET ? undefined : Number(value)

const textOf = (value: string): string | undefined =>
  value.trim() === UNSET ? undefined : value

export const rangeOf = (state: PlaygroundState): CalendarRange => ({
  view: state.view,
  currentDate: state.currentDate,
  timeZone: state.timeZone,
  ...optional(
    'weekStartsOn',
    numberOf(state.weekStartsOn) as WeekStartsOn | undefined
  ),
  ...optional('dayCount', numberOf(state.dayCount)),
  ...optional('slotMinutes', numberOf(state.slotMinutes)),
  ...optional(
    'disambiguation',
    textOf(state.disambiguation) as Disambiguation | undefined
  )
})

export const sourceOf = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT)

const problemIn = (entry: unknown, index: number): string | null => {
  if (typeof entry !== 'object' || entry === null)
    return eventNotAnObject(index)

  const candidate = entry as Partial<EventInput<EventData>>

  if (typeof candidate.id !== 'string') return eventWithoutId(index)

  if (typeof candidate.start !== 'string') return eventWithoutStart(index)

  return null
}

export const parseEvents = (source: string): ParseResult => {
  let parsed: unknown

  try {
    parsed = JSON.parse(source)
  } catch (cause) {
    return { events: null, problem: (cause as Error).message }
  }

  if (!Array.isArray(parsed))
    return { events: null, problem: EVENTS_NOT_AN_ARRAY }

  const found = parsed
    .map((entry, index) => problemIn(entry, index))
    .find((problem) => problem !== null)

  if (found) return { events: null, problem: found }

  return { events: parsed as readonly EventInput<EventData>[], problem: null }
}
