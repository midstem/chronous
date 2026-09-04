import type { CalendarRange } from '@midstem/chronous'
import { computed } from '@angular/core'
import type { Signal } from '@angular/core'

import { sameRange } from './helpers'

export const stableRange = (
  range: () => CalendarRange
): Signal<CalendarRange> => computed(range, { equal: sameRange })
