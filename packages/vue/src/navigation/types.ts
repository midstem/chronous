import type { CalendarRange, ViewKind } from '@midstem/chronous'
import type { ComputedRef } from 'vue'

export type CalendarNavigation = {
  next: CalendarRange | null
  prev: CalendarRange | null
  today: (() => CalendarRange) | null
  withView: (view: ViewKind) => CalendarRange
}

export type UseCalendarNavigation = {
  readonly next: ComputedRef<CalendarRange | null>
  readonly prev: ComputedRef<CalendarRange | null>
  readonly today: ComputedRef<(() => CalendarRange) | null>
  readonly withView: (view: ViewKind) => CalendarRange
  readonly value: CalendarNavigation
}
