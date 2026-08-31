import type { CalendarRange } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableRange } from '#src/range'

import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

export const useCalendarNavigation = (
  range: CalendarRange
): CalendarNavigation => {
  const held = useStableRange(range)

  return useMemo(() => navigationOf(held), [held])
}

export type * from './types'
