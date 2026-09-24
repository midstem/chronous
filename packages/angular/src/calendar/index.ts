import type { EventInput, CalendarRange } from '@midstem/chronous'
import { computed } from '@angular/core'
import type { Signal } from '@angular/core'

import { stableRange } from '../range'

import { resultOf } from './helpers'
import type { CalendarResult } from './types'

export const injectCalendar = <TData>(
  range: () => CalendarRange,
  events: () => readonly EventInput<TData>[]
): Signal<CalendarResult<TData>> => {
  const held = stableRange(range)

  return computed(() => resultOf(held(), events()))
}

export type * from './types'
