import type { LocaleId, CalendarRange } from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'

const MONTH_TITLE = { month: 'long', year: 'numeric' } as const

const DAY_TITLE = { ...MONTH_TITLE, day: 'numeric' } as const

export const titleOf = (range: CalendarRange, locale: LocaleId): string => {
  try {
    return formatIso(range.date, {
      locale,
      options: range.view === 'month' ? MONTH_TITLE : DAY_TITLE
    })
  } catch {
    return range.date
  }
}
