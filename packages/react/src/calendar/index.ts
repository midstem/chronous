import type { EventInput, CalendarRange } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableRange } from '#src/range'
import { useTemporalStatus } from '#src/temporal'

import { resultOf } from './helpers'
import type { CalendarResult } from './types'

export const useCalendar = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarResult<TData> => {
  const held = useStableRange(range)
  const status = useTemporalStatus()

  return useMemo(() => resultOf(held, events, status), [held, events, status])
}

export type * from './types'
