import type { RangeSpec } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableSpec } from '#src/spec'

import { navigationOf } from './helpers'
import type { CalendarNavigation } from './types'

export const useCalendarNavigation = (spec: RangeSpec): CalendarNavigation => {
  const held = useStableSpec(spec)

  return useMemo(() => navigationOf(held), [held])
}

export type * from './types'
