import type { EventInput, CalendarRange } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableRange } from '#src/range'

import { resultOf } from './helpers'
import type { CalendarResult } from './types'

export const useCalendar = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarResult<TData> => {
  const held = useStableRange(range)

  return useMemo(() => resultOf(held, events), [held, events])
}

export type * from './types'
