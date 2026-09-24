import type {
  CalendarLayout,
  IsoDate,
  LocaleId,
  ViewKind
} from '@midstem/chronous-react'

import { formatMonth, formatShort, formatTitle } from '../labels'

import { SLOTTED_VIEWS } from './constants'

export const periodDate = <TData>(calendar: CalendarLayout<TData>): IsoDate =>
  (calendar.days.find((day) => day.inCurrentPeriod) ?? calendar.days[0]).date

export const isSlotted = (view: ViewKind): boolean =>
  SLOTTED_VIEWS.includes(view)

const lastDate = <TData>(calendar: CalendarLayout<TData>): IsoDate =>
  calendar.days[calendar.days.length - 1].date

export const titleOf = <TData>(
  calendar: CalendarLayout<TData>,
  locale: LocaleId
): string => {
  const anchor = periodDate(calendar)

  if (calendar.view === 'day') return formatTitle(anchor, locale)

  if (calendar.view === 'month') return formatMonth(anchor, locale)

  return `${formatShort(calendar.days[0].date, locale)} – ${formatTitle(lastDate(calendar), locale)}`
}
