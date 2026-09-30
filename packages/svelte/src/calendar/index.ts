import { derived, type Readable } from 'svelte/store'
import type { CalendarRange, EventInput } from '../engine.js'
import { resultOf } from './helpers'
import type { CalendarResult } from './types'

/** Reactive calendar result that updates when either Svelte store changes. */
export const useCalendar = <TData>(
  range: Readable<CalendarRange>,
  events: Readable<readonly EventInput<TData>[]>
): Readable<CalendarResult<TData>> =>
  derived([range, events], ([$range, $events]) => resultOf($range, $events))

/** Synchronous counterpart for non-reactive inputs. */
export const calendarResult = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarResult<TData> => resultOf(range, events)

export type * from './types'
