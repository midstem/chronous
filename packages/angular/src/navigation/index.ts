import type { CalendarRange } from '@midstem/chronous'
import { computed } from '@angular/core'
import type { Signal } from '@angular/core'

import { stableRange } from '../range'

import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

export const injectCalendarNavigation = (
  range: () => CalendarRange
): Signal<CalendarNavigation> => {
  const held = stableRange(range)

  return computed(() => navigationOf(held()))
}

export type * from './types'
