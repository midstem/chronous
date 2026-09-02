import type { CalendarRange } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableRange } from '#src/range'
import { useTemporalStatus } from '#src/temporal'

import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

export const useCalendarNavigation = (
  range: CalendarRange
): CalendarNavigation => {
  const held = useStableRange(range)
  const status = useTemporalStatus()

  return useMemo(() => navigationOf(held, status), [held, status])
}

export type * from './types'
