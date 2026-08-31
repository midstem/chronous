import type { CalendarRange, ViewKind } from '@midstem/chronous'

export type CalendarNavigation = {
  next: CalendarRange | null
  prev: CalendarRange | null
  today: (() => CalendarRange) | null
  withView: (view: ViewKind) => CalendarRange
}
