import type { CalendarLayout, IsoDate, LocaleId } from '@midstem/chronous'
import {
  CELL_MIN_HEIGHT,
  MONTH_BAR_GAP,
  MONTH_LANE_HEIGHT,
  MONTH_MAX_LANES,
  NUMBER_HEIGHT,
  WEEK_COLUMNS,
  formatNumber,
  formatWeekday
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import {
  edge,
  hiddenLanes,
  laneCount,
  percentOf,
  rowBarsByDay,
  rowsWithDays,
  visibleLanes
} from './helpers'

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-surface'
    : 'flex size-6 items-center justify-center text-xs font-medium'

export const renderMonth = (
  calendar: CalendarLayout<EventData>,
  locale: LocaleId,
  today: IsoDate | null
): string => {
  const rows = rowsWithDays(calendar)
  const firstRow = rows[0]

  const weekdaysHtml = firstRow
    ? firstRow.days
        .map(
          (day) => `
        <span class="border-l border-hair py-1.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase first:border-l-0">
          ${formatWeekday(day.date, locale)}
        </span>`
        )
        .join('')
    : ''

  const rowsHtml = rows
    .map(({ row, days }) => {
      const barsByDay = rowBarsByDay(row, days.length)
      const lanes = laneCount(row.lanes, MONTH_MAX_LANES)

      const daysHtml = days
        .map((day, index) => {
          const isToday = day.date === today
          const dayLabel = formatNumber(day.date, locale)
          const bars = barsByDay[index]
          const hidden = hiddenLanes(bars, MONTH_MAX_LANES)

          const timedHtml = day.boxes
            .map((box) => {
              const title = box.event.data?.title ?? box.event.id
              return `
              <span
                data-event-id="${box.event.id}"
                class="flex items-center gap-1 truncate rounded bg-event-timed px-1 text-[11px] leading-5 text-event-timed-ink hover:brightness-110"
              >
                <span class="truncate" title="${title}">
                  ${title}
                </span>
              </span>`
            })
            .join('')

          return `
          <div
            data-date="${day.date}"
            data-in-current-period="${day.inCurrentPeriod}"
            class="flex flex-col border-l border-hair px-1 pb-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
          >
            <span
              class="flex items-center justify-center"
              style="height: ${NUMBER_HEIGHT}px;"
            >
              <span class="${numberClass(isToday)}">
                ${dayLabel}
              </span>
            </span>

            <span class="block" style="height: ${lanes * MONTH_LANE_HEIGHT}px;"></span>

            ${
              hidden.length > 0
                ? `<span class="px-1 text-[10px] font-medium text-muted">+${hidden.length} more</span>`
                : ''
            }

            <span class="flex flex-col gap-0.5">
              ${timedHtml}
            </span>
          </div>`
        })
        .join('')

      const allDayBarsHtml = visibleLanes(row.bars, MONTH_MAX_LANES)
        .map((bar) => {
          const title = bar.event.data?.title ?? bar.event.id
          return `
          <div
            data-event-id="${bar.event.id}"
            data-continues-before="${bar.continuesBefore}"
            data-continues-after="${bar.continuesAfter}"
            style="position: absolute; left: calc(${percentOf(bar.left)} + ${MONTH_BAR_GAP / 2}px); width: calc(${percentOf(bar.width)} - ${MONTH_BAR_GAP}px); top: ${NUMBER_HEIGHT + bar.lane * MONTH_LANE_HEIGHT}px; height: ${MONTH_LANE_HEIGHT}px; z-index: 1;"
          >
            <span
              class="flex h-full items-center truncate rounded bg-event-all-day px-1.5 text-[11px] font-medium text-event-all-day-ink"
              title="${title}"
            >
              ${edge(bar.continuesBefore)}${title}${edge(bar.continuesAfter)}
            </span>
          </div>`
        })
        .join('')

      return `
      <div
        class="border-b border-line last:border-b-0"
        style="position: relative; flex: 1; display: grid; grid-template-columns: repeat(${days.length}, minmax(0, 1fr)); min-height: ${CELL_MIN_HEIGHT}px;"
      >
        ${daysHtml}
        ${allDayBarsHtml}
      </div>`
    })
    .join('')

  return `
    <div>
      <div
        class="grid border-b border-line"
        style="grid-template-columns: ${WEEK_COLUMNS};"
      >
        ${weekdaysHtml}
      </div>
      ${rowsHtml}
    </div>
  `
}
