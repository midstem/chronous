import type { CalendarRange, LocaleId } from '../../engine.js'
import { formatIso } from '../../engine.js'

const MONTH_TITLE = { month: 'long', year: 'numeric' } as const
const DAY_TITLE = { ...MONTH_TITLE, day: 'numeric' } as const

export const titleOf = (range: CalendarRange, locale: LocaleId): string => {
  try {
    return formatIso(range.currentDate, {
      locale,
      options: range.view === 'month' ? MONTH_TITLE : DAY_TITLE
    })
  } catch {
    return range.currentDate
  }
}
