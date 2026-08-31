import type { LocaleId, RangeSpec } from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'

const MONTH_TITLE = { month: 'long', year: 'numeric' } as const

const DAY_TITLE = { ...MONTH_TITLE, day: 'numeric' } as const

export const titleOf = (spec: RangeSpec, locale: LocaleId): string => {
  try {
    return formatIso(spec.date, {
      locale,
      options: spec.view === 'month' ? MONTH_TITLE : DAY_TITLE
    })
  } catch {
    return spec.date
  }
}
