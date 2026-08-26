import {
  DAYS_IN_WEEK,
  add,
  compare,
  dayOfMonth,
  dayOfWeek,
  daysBetween,
  daysInMonth,
  monthOfYear,
  startOfMonth,
  startOfWeekDate,
  startOfYear,
  toIso,
  withDayOfMonth,
  withMonthOfYear,
  yearOf
} from '#src/time'
import type { CalendarDate, TimeSpanLike } from '#src/time'

import { ISO_WEEKDAY, MONTHS_IN_YEAR } from './constants'
import type { ByDay, RecurrenceRule } from './types'

const datesInMonth = (monthStart: CalendarDate): CalendarDate[] =>
  Array.from({ length: daysInMonth(monthStart) }, (_, index) =>
    add(monthStart, { days: index })
  )

const datesInYear = (yearStart: CalendarDate): CalendarDate[] =>
  Array.from({ length: MONTHS_IN_YEAR }, (_, index) =>
    withMonthOfYear(yearStart, index + 1)
  ).flatMap((monthStart) => datesInMonth(monthStart))

const pick = <TItem>(
  items: readonly TItem[],
  position: number
): TItem | undefined =>
  position > 0 ? items[position - 1] : items[items.length + position]

const unique = (dates: readonly CalendarDate[]): CalendarDate[] =>
  [...new Map(dates.map((date) => [toIso(date), date])).values()].sort((a, b) =>
    compare(a, b)
  )

const matchesMonth = (rule: RecurrenceRule, date: CalendarDate): boolean =>
  rule.byMonth.length === 0 || rule.byMonth.includes(monthOfYear(date))

const matchesMonthDay = (rule: RecurrenceRule, date: CalendarDate): boolean => {
  if (rule.byMonthDay.length === 0) return true

  const day = dayOfMonth(date)

  return (
    rule.byMonthDay.includes(day) ||
    rule.byMonthDay.includes(day - daysInMonth(date) - 1)
  )
}

const matchesWeekDay = (rule: RecurrenceRule, date: CalendarDate): boolean =>
  rule.byDay.length === 0 ||
  rule.byDay.some((item) => ISO_WEEKDAY[item.weekday] === dayOfWeek(date))

const selectByDay = (
  items: readonly ByDay[],
  dates: readonly CalendarDate[]
): CalendarDate[] =>
  items.flatMap((item) => {
    const matching = dates.filter(
      (date) => dayOfWeek(date) === ISO_WEEKDAY[item.weekday]
    )

    if (item.ordinal === undefined) return matching

    const chosen = pick(matching, item.ordinal)

    return chosen ? [chosen] : []
  })

const monthDayDates = (
  values: readonly number[],
  monthStart: CalendarDate
): CalendarDate[] => {
  const size = daysInMonth(monthStart)

  return values.flatMap((value) => {
    const day = value > 0 ? value : size + value + 1

    return day >= 1 && day <= size ? [withDayOfMonth(monthStart, day)] : []
  })
}

const dailyCandidates = (
  rule: RecurrenceRule,
  date: CalendarDate
): CalendarDate[] =>
  matchesMonth(rule, date) &&
  matchesMonthDay(rule, date) &&
  matchesWeekDay(rule, date)
    ? [date]
    : []

const weeklyCandidates = (
  rule: RecurrenceRule,
  weekStart: CalendarDate,
  base: CalendarDate
): CalendarDate[] =>
  Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    add(weekStart, { days: index })
  )
    .filter((date) =>
      rule.byDay.length === 0
        ? dayOfWeek(date) === dayOfWeek(base)
        : matchesWeekDay(rule, date)
    )
    .filter((date) => matchesMonth(rule, date))

const monthlyCandidates = (
  rule: RecurrenceRule,
  monthStart: CalendarDate,
  base: CalendarDate
): CalendarDate[] => {
  if (!matchesMonth(rule, monthStart)) return []

  if (rule.byMonthDay.length > 0)
    return monthDayDates(rule.byMonthDay, monthStart).filter((date) =>
      matchesWeekDay(rule, date)
    )

  if (rule.byDay.length > 0)
    return selectByDay(rule.byDay, datesInMonth(monthStart))

  const day = dayOfMonth(base)

  return day <= daysInMonth(monthStart) ? [withDayOfMonth(monthStart, day)] : []
}

const yearlyCandidates = (
  rule: RecurrenceRule,
  yearStart: CalendarDate,
  base: CalendarDate
): CalendarDate[] => {
  const months = rule.byMonth.length > 0 ? rule.byMonth : [monthOfYear(base)]
  const monthStarts = months.map((month) => withMonthOfYear(yearStart, month))

  if (rule.byMonthDay.length > 0)
    return monthStarts
      .flatMap((monthStart) => monthDayDates(rule.byMonthDay, monthStart))
      .filter((date) => matchesWeekDay(rule, date))

  if (rule.byDay.length > 0)
    return rule.byMonth.length > 0
      ? monthStarts.flatMap((monthStart) =>
          selectByDay(rule.byDay, datesInMonth(monthStart))
        )
      : selectByDay(rule.byDay, datesInYear(yearStart))

  const day = dayOfMonth(base)

  return monthStarts.flatMap((monthStart) =>
    day <= daysInMonth(monthStart) ? [withDayOfMonth(monthStart, day)] : []
  )
}

export const periodStartOf = (
  rule: RecurrenceRule,
  base: CalendarDate
): CalendarDate => {
  if (rule.frequency === 'WEEKLY')
    return startOfWeekDate(base, rule.weekStartsOn)

  if (rule.frequency === 'MONTHLY') return startOfMonth(base)

  if (rule.frequency === 'YEARLY') return startOfYear(base)

  return base
}

const periodSpan = (rule: RecurrenceRule, periods: number): TimeSpanLike => {
  if (rule.frequency === 'WEEKLY') return { weeks: periods }

  if (rule.frequency === 'MONTHLY') return { months: periods }

  if (rule.frequency === 'YEARLY') return { years: periods }

  return { days: periods }
}

export const periodStepOf = (rule: RecurrenceRule): TimeSpanLike =>
  periodSpan(rule, rule.interval)

const monthsBetween = (from: CalendarDate, to: CalendarDate): number =>
  (yearOf(to) - yearOf(from)) * MONTHS_IN_YEAR +
  monthOfYear(to) -
  monthOfYear(from)

const periodsBetween = (
  rule: RecurrenceRule,
  start: CalendarDate,
  from: CalendarDate
): number => {
  if (rule.frequency === 'WEEKLY')
    return Math.floor(
      daysBetween(start, startOfWeekDate(from, rule.weekStartsOn)) /
        DAYS_IN_WEEK
    )

  if (rule.frequency === 'MONTHLY') return monthsBetween(start, from)

  if (rule.frequency === 'YEARLY') return yearOf(from) - yearOf(start)

  return daysBetween(start, from)
}

export const seekPeriodOf = (
  rule: RecurrenceRule,
  base: CalendarDate,
  from: CalendarDate
): CalendarDate => {
  const start = periodStartOf(rule, base)
  const distance = periodsBetween(rule, start, from)

  if (distance < rule.interval) return start

  return add(start, periodSpan(rule, distance - (distance % rule.interval)))
}

export const candidatesOf = (
  rule: RecurrenceRule,
  period: CalendarDate,
  base: CalendarDate
): CalendarDate[] => {
  const raw =
    rule.frequency === 'DAILY'
      ? dailyCandidates(rule, period)
      : rule.frequency === 'WEEKLY'
        ? weeklyCandidates(rule, period, base)
        : rule.frequency === 'MONTHLY'
          ? monthlyCandidates(rule, period, base)
          : yearlyCandidates(rule, period, base)

  const sorted = unique(raw)

  if (rule.bySetPos.length === 0) return sorted

  return unique(
    rule.bySetPos.flatMap((position) => {
      const chosen = pick(sorted, position)

      return chosen ? [chosen] : []
    })
  )
}
