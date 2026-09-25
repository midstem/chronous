import type { CalendarRange, EventInput } from '@midstem/chronous'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

import { useStableRange } from '#src/range'

import { resultOf } from './helpers'
import type { CalendarResult } from './types'

export const useCalendar = <TData = unknown>(
  range: MaybeRefOrGetter<CalendarRange>,
  events: MaybeRefOrGetter<readonly EventInput<TData>[]>
): CalendarResult<TData> => {
  const held = useStableRange(range)

  const res = computed(() => resultOf(held.value, toValue(events)))

  return {
    calendar: computed(() => res.value.calendar),
    error: computed(() => res.value.error)
  }
}

export type * from './types'
