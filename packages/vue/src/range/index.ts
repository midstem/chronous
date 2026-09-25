import type { CalendarRange } from '@midstem/chronous'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, shallowRef, toValue } from 'vue'

import { sameRange } from './helpers'

export const useStableRange = (
  range: MaybeRefOrGetter<CalendarRange>
): ComputedRef<CalendarRange> => {
  const held = shallowRef<CalendarRange>(toValue(range))

  return computed(() => {
    const current = toValue(range)

    if (!sameRange(held.value, current)) held.value = current

    return held.value
  })
}
