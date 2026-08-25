import type { RangeSpec, ViewKind } from '@midstem/chronous'

export type CalendarNavigation = {
  next: RangeSpec | null
  prev: RangeSpec | null
  today: (() => RangeSpec) | null
  withView: (view: ViewKind) => RangeSpec
}
