import type { EventInput, RangeSpec } from '@midstem/chronous'
import { useMemo } from 'react'

import { useStableSpec } from '#src/spec'

import { resultOf } from './helpers'
import type { CalendarResult } from './types'

export const useCalendar = <TData>(
  spec: RangeSpec,
  events: readonly EventInput<TData>[]
): CalendarResult<TData> => {
  const held = useStableSpec(spec)

  return useMemo(() => resultOf(held, events), [held, events])
}

export type * from './types'
