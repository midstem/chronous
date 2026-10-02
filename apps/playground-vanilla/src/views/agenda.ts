import type { CalendarLayout, IsoDate, LocaleId } from '@midstem/chronous'
import {
  ALL_DAY_LABEL,
  EMPTY_LABEL,
  dotOf,
  formatDay,
  formatNumber,
  formatTime,
  formatWeekday
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { barsByDay, escapeHtml } from './helpers'

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
    : 'flex size-7 items-center justify-center text-sm font-semibold'

export const renderAgenda = (
  calendar: CalendarLayout<EventData>,
  locale: LocaleId,
  today: IsoDate | null
): string => {
  const days = calendar.days
  const dayBars = barsByDay(calendar)

  const itemsHtml = days
    .map((day, index) => {
      const isToday = day.date === today
      const weekdayLabel = formatWeekday(day.date, locale)
      const dayLabel = formatNumber(day.date, locale)
      const bars = dayBars[index] ?? []
      const boxes = day.boxes
      const isEmpty = bars.length === 0 && boxes.length === 0

      const allDayEventsHtml = bars
        .map((bar) => {
          const title = escapeHtml(
            String(bar.event.data?.title ?? bar.event.id)
          )
          return `
          <span class="flex items-center gap-2 text-[13px]">
            <span class="size-2 shrink-0 rounded-full ${dotOf(bar.event.id)}"></span>
            <span class="w-24 shrink-0 text-[11px] text-faint">${ALL_DAY_LABEL}</span>
            <span class="truncate">${title}</span>
          </span>`
        })
        .join('')

      const timedEventsHtml = boxes
        .map((box) => {
          const title = escapeHtml(
            String(box.event.data?.title ?? box.event.id)
          )
          const timeRangeLabel = `${formatTime(box.start, locale)} – ${formatTime(box.end, locale)}`
          return `
          <span class="flex items-center gap-2 text-[13px]">
            <span class="size-2 shrink-0 rounded-full ${dotOf(box.event.id)}"></span>
            <span class="w-24 shrink-0 font-mono text-[11px] tabular-nums text-muted">${timeRangeLabel}</span>
            <span class="truncate">${title}</span>
          </span>`
        })
        .join('')

      return `
      <li
        data-date="${day.date}"
        data-in-current-period="${day.inCurrentPeriod}"
        class="grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-3 data-[in-current-period=false]:bg-sunken"
      >
        <div
          class="flex items-baseline gap-2"
          title="${formatDay(day.date, locale)}"
        >
          <span class="${numberClass(isToday)}">${dayLabel}</span>
          <span class="text-[11px] tracking-wide text-muted uppercase">
            ${weekdayLabel}
          </span>
        </div>

        <div class="flex flex-col gap-1">
          ${isEmpty ? `<span class="text-[13px] text-faint">${EMPTY_LABEL}</span>` : ''}
          ${allDayEventsHtml}
          ${timedEventsHtml}
        </div>
      </li>`
    })
    .join('')

  return `<ul class="divide-y divide-hair">${itemsHtml}</ul>`
}
