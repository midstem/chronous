import type { CalendarRange, ViewKind } from '@midstem/chronous'
import type { MaybeRefOrGetter } from 'vue'
import { computed } from 'vue'

import { useStableRange } from '#src/range'

import { navigationOf } from './helpers'
import type { CalendarNavigation, UseCalendarNavigation } from './types'

export const useCalendarNavigation = (
  range: MaybeRefOrGetter<CalendarRange>
): UseCalendarNavigation => {
  const held = useStableRange(range)

  const nav = computed(() => navigationOf(held.value))

  const next = computed(() => nav.value.next)
  const prev = computed(() => nav.value.prev)
  const today = computed(() => nav.value.today)
  const withView = (view: ViewKind): CalendarRange => nav.value.withView(view)

  return {
    next,
    prev,
    today,
    withView,
    get value(): CalendarNavigation {
      return nav.value
    }
  }
}

export type * from './types'
