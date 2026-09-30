import type { CalendarRange, ViewKind } from '../engine.js'

export type CalendarNavigation = {
  next: CalendarRange | null
  prev: CalendarRange | null
  today: (() => CalendarRange) | null
  withView: (view: ViewKind) => CalendarRange
}
