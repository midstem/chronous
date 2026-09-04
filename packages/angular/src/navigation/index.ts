import type { CalendarRange } from '@midstem/chronous'
import { computed } from '@angular/core'
import type { Signal } from '@angular/core'

import { stableRange } from '../range'
import { injectTemporalStatus } from '../temporal'

import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

export const injectCalendarNavigation = (
  range: () => CalendarRange
): Signal<CalendarNavigation> => {
  const held = stableRange(range)
  const status = injectTemporalStatus()

  return computed(() => navigationOf(held(), status()))
}

export type * from './types'
