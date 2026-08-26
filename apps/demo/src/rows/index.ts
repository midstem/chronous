import type { Calendar, CalendarDay, CalendarRow } from '@midstem/chronous'

export type RowDays<TData> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
}

export const rowsWithDays = <TData>(
  calendar: Calendar<TData>
): RowDays<TData>[] => {
  let taken = 0

  return calendar.rows.map((row) => {
    const days = calendar.days.slice(taken, taken + row.days)

    taken += row.days

    return { row, days }
  })
}

export const barsOnDay = <TData>(
  calendar: Calendar<TData>,
  index: number
): CalendarRow<TData>['bars'] => {
  let taken = 0

  for (const row of calendar.rows) {
    if (index < taken + row.days) {
      const offset = index - taken

      return row.bars.filter(
        (bar) => bar.startDay <= offset && offset < bar.endDay
      )
    }

    taken += row.days
  }

  return []
}
