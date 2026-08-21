import type { RangeSpec, ViewKind } from '@midstem/chronous'

export type CalendarNavigation = {
  next: RangeSpec | null
  prev: RangeSpec | null
  today: () => RangeSpec
  withView: (view: ViewKind) => RangeSpec
}
