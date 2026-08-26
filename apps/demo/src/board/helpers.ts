import type { Calendar, IsoDate, LocaleId, ViewKind } from '@midstem/chronous'

import { monthLabel, shortLabel, titleLabel } from '../labels'

import { SLOTTED_VIEWS } from './constants'

export const periodDate = <TData>(calendar: Calendar<TData>): IsoDate =>
  (calendar.days.find((day) => day.inPeriod) ?? calendar.days[0]).date

export const isSlotted = (view: ViewKind): boolean =>
  SLOTTED_VIEWS.includes(view)

const lastDate = <TData>(calendar: Calendar<TData>): IsoDate =>
  calendar.days[calendar.days.length - 1].date

export const titleOf = <TData>(
  calendar: Calendar<TData>,
  locale: LocaleId
): string => {
  const anchor = periodDate(calendar)

  if (calendar.view === 'day') return titleLabel(anchor, locale)

  if (calendar.view === 'month') return monthLabel(anchor, locale)

  return `${shortLabel(calendar.days[0].date, locale)} – ${titleLabel(lastDate(calendar), locale)}`
}
