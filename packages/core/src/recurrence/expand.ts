import { add, compare } from '#src/time'
import type { CalendarDate } from '#src/time'

import {
  candidatesOf,
  periodStartOf,
  periodStepOf,
  seekPeriodOf
} from './candidates'
import { MAX_EMPTY_PERIODS } from './constants'
import type { RecurrenceRule } from './types'

export function* ruleDates(
  rule: RecurrenceRule,
  base: CalendarDate,
  until: CalendarDate | undefined,
  from: CalendarDate
): Generator<CalendarDate> {
  const step = periodStepOf(rule)

  let period =
    rule.count === undefined
      ? seekPeriodOf(rule, base, from)
      : periodStartOf(rule, base)
  let produced = 0
  let empty = 0

  while (empty <= MAX_EMPTY_PERIODS) {
    const dates = candidatesOf(rule, period, base).filter(
      (date) => compare(date, base) >= 0
    )

    empty = dates.length === 0 ? empty + 1 : 0

    for (const date of dates) {
      if (until && compare(date, until) > 0) return

      yield date

      produced += 1

      if (rule.count !== undefined && produced >= rule.count) return
    }

    period = add(period, step)
  }
}
