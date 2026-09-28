import { ISO_WEEKDAY } from '../../recurrence/constants'
import type { ByDay, RecurrenceRule } from '../../recurrence/types'

import {
  addDaysToDate,
  daysDifference,
  daysInMonth,
  formatDateOnly,
  isoDayOfWeek,
  parseDateOnly
} from './time'

const monthDates = (year: number, month: number): string[] =>
  Array.from({ length: daysInMonth(year, month) }, (_, index) =>
    formatDateOnly(year, month, index + 1)
  )

const pick = <T>(items: readonly T[], position: number): T | undefined =>
  position > 0 ? items[position - 1] : items[items.length + position]

const unique = (dates: readonly string[]): string[] =>
  [...new Set(dates)].sort()

const matchesWeekDay = (rule: RecurrenceRule, date: string): boolean =>
  rule.byDay.length === 0 ||
  rule.byDay.some((item) => ISO_WEEKDAY[item.weekday] === isoDayOfWeek(date))

const selectByDay = (items: readonly ByDay[], dates: string[]): string[] =>
  items.flatMap((item) => {
    const matching = dates.filter(
      (date) => isoDayOfWeek(date) === ISO_WEEKDAY[item.weekday]
    )
    if (item.ordinal === undefined) return matching
    const chosen = pick(matching, item.ordinal)
    return chosen === undefined ? [] : [chosen]
  })

const monthDayDates = (
  values: readonly number[],
  year: number,
  month: number
): string[] => {
  const size = daysInMonth(year, month)
  return values.flatMap((value) => {
    const day = value > 0 ? value : size + value + 1
    return day >= 1 && day <= size ? [formatDateOnly(year, month, day)] : []
  })
}

const startOfWeek = (date: string, weekStartsOn: number): string => {
  const first = weekStartsOn === 0 ? 7 : weekStartsOn
  return addDaysToDate(date, -((isoDayOfWeek(date) - first + 7) % 7))
}

const periodOf = (rule: RecurrenceRule, date: string): string => {
  const { year, month } = parseDateOnly(date)
  if (rule.frequency === 'WEEKLY') return startOfWeek(date, rule.weekStartsOn)
  if (rule.frequency === 'MONTHLY') return formatDateOnly(year, month, 1)
  if (rule.frequency === 'YEARLY') return formatDateOnly(year, 1, 1)
  return date
}

export const matchesFallbackRule = (
  rule: RecurrenceRule,
  anchor: string,
  date: string,
  cache: Map<string, string[]>
): boolean => {
  if (date < anchor) return false

  const period = periodOf(rule, date)
  const firstPeriod = periodOf(rule, anchor)
  const current = parseDateOnly(period)
  const first = parseDateOnly(firstPeriod)
  const distance =
    rule.frequency === 'DAILY'
      ? daysDifference(firstPeriod, period)
      : rule.frequency === 'WEEKLY'
        ? daysDifference(firstPeriod, period) / 7
        : rule.frequency === 'MONTHLY'
          ? (current.year - first.year) * 12 + current.month - first.month
          : current.year - first.year
  if (distance % rule.interval !== 0) return false

  let candidates = cache.get(period)
  if (!candidates) {
    const base = parseDateOnly(anchor)
    if (rule.frequency === 'DAILY') {
      const { year, month, day } = current
      const monthDay = day - daysInMonth(year, month) - 1
      candidates =
        (rule.byMonth.length === 0 || rule.byMonth.includes(month)) &&
        (rule.byMonthDay.length === 0 ||
          rule.byMonthDay.includes(day) ||
          rule.byMonthDay.includes(monthDay)) &&
        matchesWeekDay(rule, period)
          ? [period]
          : []
    } else if (rule.frequency === 'WEEKLY') {
      candidates = Array.from({ length: 7 }, (_, index) =>
        addDaysToDate(period, index)
      ).filter((candidate) => {
        const month = parseDateOnly(candidate).month
        return (
          (rule.byMonth.length === 0 || rule.byMonth.includes(month)) &&
          (rule.byDay.length === 0
            ? isoDayOfWeek(candidate) === isoDayOfWeek(anchor)
            : matchesWeekDay(rule, candidate))
        )
      })
    } else if (rule.frequency === 'MONTHLY') {
      const { year, month } = current
      candidates =
        rule.byMonth.length > 0 && !rule.byMonth.includes(month)
          ? []
          : rule.byMonthDay.length > 0
            ? monthDayDates(rule.byMonthDay, year, month).filter((candidate) =>
                matchesWeekDay(rule, candidate)
              )
            : rule.byDay.length > 0
              ? selectByDay(rule.byDay, monthDates(year, month))
              : base.day <= daysInMonth(year, month)
                ? [formatDateOnly(year, month, base.day)]
                : []
    } else {
      const months = rule.byMonth.length > 0 ? rule.byMonth : [base.month]
      candidates =
        rule.byMonthDay.length > 0
          ? months
              .flatMap((month) =>
                monthDayDates(rule.byMonthDay, current.year, month)
              )
              .filter((candidate) => matchesWeekDay(rule, candidate))
          : rule.byDay.length > 0
            ? rule.byMonth.length > 0
              ? months.flatMap((month) =>
                  selectByDay(rule.byDay, monthDates(current.year, month))
                )
              : selectByDay(
                  rule.byDay,
                  Array.from({ length: 12 }, (_, index) => index + 1).flatMap(
                    (month) => monthDates(current.year, month)
                  )
                )
            : months.flatMap((month) =>
                base.day <= daysInMonth(current.year, month)
                  ? [formatDateOnly(current.year, month, base.day)]
                  : []
              )
    }

    const sorted = unique(candidates)
    if (rule.bySetPos.length > 0)
      candidates = unique(
        rule.bySetPos.flatMap((position) => {
          const chosen = pick(sorted, position)
          return chosen === undefined ? [] : [chosen]
        })
      )
    else candidates = sorted
    cache.set(period, candidates)
  }

  return candidates.includes(date)
}
