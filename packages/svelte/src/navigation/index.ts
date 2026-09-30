import { derived, type Readable } from 'svelte/store'
import type { CalendarRange } from '../engine.js'
import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

/** Reactive Svelte-store navigation derived from a calendar range store. */
export const useCalendarNavigation = (
  range: Readable<CalendarRange>
): Readable<CalendarNavigation> => derived(range, navigationOf)

/** Synchronous counterpart for ordinary values and event handlers. */
export const calendarNavigation = (range: CalendarRange): CalendarNavigation =>
  navigationOf(range)

export type * from './types'
