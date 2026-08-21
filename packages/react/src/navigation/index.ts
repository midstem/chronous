import type { Calendar, RangeSpec } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableSpec } from '#src/spec'

import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

export const useCalendarNavigation = <TData>(
  calendar: Calendar<TData> | null,
  spec: RangeSpec
): CalendarNavigation => {
  const held = useStableSpec(spec)

  return useMemo(() => navigationOf(calendar, held), [calendar, held])
}

export type * from './types'
