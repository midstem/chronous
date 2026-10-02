import type { CalendarLayout, LocaleId } from '@midstem/chronous'
import {
  formatNumber,
  formatTime,
  formatWeekday
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { barsByDay } from './helpers'

export const renderPlainAgenda = (
  calendar: CalendarLayout<EventData>,
  locale: LocaleId
): string => {
  const days = calendar.days
  const dayBars = barsByDay(calendar)

  const itemsHtml = days
    .map((day, index) => {
      const weekdayLabel = formatWeekday(day.date, locale)
      const dayLabel = formatNumber(day.date, locale)
      const bars = dayBars[index] ?? []
      const boxes = day.boxes

      const allDayEventsHtml = bars
        .map((bar) => {
          const title = bar.event.data?.title ?? bar.event.id
          return `<span class="text-[13px]">${title} · all-day</span>`
        })
        .join('')

      const timedEventsHtml = boxes
        .map((box) => {
          const title = box.event.data?.title ?? box.event.id
          const timeRangeLabel = `${formatTime(box.start, locale)} – ${formatTime(box.end, locale)}`
          return `<span class="text-[13px]">${title} · ${timeRangeLabel}</span>`
        })
        .join('')

      return `
      <li class="flex gap-4 px-4 py-3">
        <span class="w-16 shrink-0 text-sm font-semibold">
          ${weekdayLabel} ${dayLabel}
        </span>
        <span class="flex flex-col gap-1">
          ${allDayEventsHtml}
          ${timedEventsHtml}
        </span>
      </li>`
    })
    .join('')

  return `<ul class="divide-y divide-hair">${itemsHtml}</ul>`
}
