import type { CalendarLayout, LocaleId } from '@midstem/chronous'
import { formatNumber } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { escapeHtml, percentOf, rowsWithDays } from './helpers'

const LANE_HEIGHT = 20
const GAP = 4
const LANES_TOP_OFFSET = 28

export const renderPlainMonth = (
  calendar: CalendarLayout<EventData>,
  locale: LocaleId
): string => {
  const rows = rowsWithDays(calendar)

  const rowsHtml = rows
    .map(({ row, days }) => {
      const daysHtml = days
        .map((day) => {
          const dayLabel = formatNumber(day.date, locale)

          const timedHtml = day.boxes
            .map((box) => {
              const title = escapeHtml(
                String(box.event.data?.title ?? box.event.id)
              )
              return `
              <div
                data-event-id="${escapeHtml(box.event.id)}"
                class="truncate rounded bg-event-timed px-1 text-[11px] leading-5 text-event-timed-ink"
              >
                ${title}
              </div>`
            })
            .join('')

          return `
          <div
            data-date="${day.date}"
            data-in-current-period="${day.inCurrentPeriod}"
            class="min-h-28 border-l border-hair p-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
          >
            <div class="h-7 text-center text-xs font-medium">
              ${dayLabel}
            </div>
            <div style="height: ${row.lanes * LANE_HEIGHT}px;"></div>
            ${timedHtml}
          </div>`
        })
        .join('')

      const allDayBarsHtml = row.bars
        .map((bar) => {
          const title = escapeHtml(
            String(bar.event.data?.title ?? bar.event.id)
          )
          return `
          <div
            data-event-id="${escapeHtml(bar.event.id)}"
            data-continues-before="${bar.continuesBefore}"
            data-continues-after="${bar.continuesAfter}"
            class="truncate rounded bg-event-all-day px-1.5 text-[11px] leading-5 text-event-all-day-ink"
            style="position: absolute; left: calc(${percentOf(bar.left)} + ${GAP / 2}px); width: calc(${percentOf(bar.width)} - ${GAP}px); top: ${LANES_TOP_OFFSET + bar.lane * LANE_HEIGHT}px; height: ${LANE_HEIGHT}px; z-index: 1;"
          >
            ${title}
          </div>`
        })
        .join('')

      return `
      <div
        class="border-b border-line last:border-b-0"
        style="position: relative; flex: 1; display: grid; grid-template-columns: repeat(${days.length}, minmax(0, 1fr));"
      >
        ${daysHtml}
        ${allDayBarsHtml}
      </div>`
    })
    .join('')

  return `<div>${rowsHtml}</div>`
}
