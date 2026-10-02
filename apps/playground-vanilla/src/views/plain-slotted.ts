import type { CalendarLayout, LocaleId } from '@midstem/chronous'
import {
  ALL_DAY_BAR_GAP,
  BOX_GAP,
  GUTTER,
  HOURS_IN_DAY,
  MIN_BOX_HEIGHT,
  formatNumber,
  formatTime,
  formatWeekday
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { minutePercentOf, percentOf } from './helpers'

const LANE_HEIGHT = 20

export const renderPlainSlotted = (
  calendar: CalendarLayout<EventData>,
  locale: LocaleId,
  hourHeight: number
): string => {
  const days = calendar.days
  const dayHeight = hourHeight * HOURS_IN_DAY
  const row = calendar.rows[0]
  const lanes = row ? row.lanes : 0
  const colsTemplate = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`

  const dayHeadingsHtml = days
    .map((day) => {
      const weekdayLabel = formatWeekday(day.date, locale)
      const dayLabel = formatNumber(day.date, locale)

      return `
      <div
        data-date="${day.date}"
        data-in-current-period="${day.inCurrentPeriod}"
        class="border-l border-hair py-2 text-center text-sm font-medium"
      >
        ${weekdayLabel} ${dayLabel}
      </div>`
    })
    .join('')

  const allDayHtml =
    lanes > 0 && row
      ? `
      <div
        class="border-b border-line"
        style="display: grid; grid-template-columns: ${colsTemplate};"
      >
        <div>
          <span class="pl-2 text-[10px] text-faint">all-day</span>
        </div>
        <div style="grid-column: 2 / -1; position: relative; height: ${lanes * LANE_HEIGHT}px;">
          ${row.bars
            .map((bar) => {
              const title = bar.event.data?.title ?? bar.event.id
              return `
            <div
              data-event-id="${bar.event.id}"
              data-continues-before="${bar.continuesBefore}"
              data-continues-after="${bar.continuesAfter}"
              class="truncate rounded bg-event-all-day px-2 text-[11px] leading-6 text-event-all-day-ink"
              style="position: absolute; left: calc(${percentOf(bar.left)} + ${ALL_DAY_BAR_GAP / 2}px); width: calc(${percentOf(bar.width)} - ${ALL_DAY_BAR_GAP}px); top: ${bar.lane * LANE_HEIGHT}px; height: ${LANE_HEIGHT}px;"
            >
              ${title}
            </div>`
            })
            .join('')}
        </div>
      </div>`
      : ''

  const firstDay = days[0]
  const timeLabelsHtml = firstDay
    ? firstDay.slots
        .map((slot) => {
          const timeLabel = formatTime(slot.start, locale)
          return `
          <div
            class="right-2 text-[10px] text-faint"
            style="position: absolute; top: ${minutePercentOf(slot.minuteOfDay)}; transform: translateY(-50%);"
          >
            ${timeLabel}
          </div>`
        })
        .join('')
    : ''

  const dayColumnsHtml = days
    .map((day) => {
      const slotsHtml = day.slots
        .map(
          (slot) => `
        <span
          class="border-t border-hair"
          style="position: absolute; left: 0; right: 0; top: ${minutePercentOf(slot.minuteOfDay)};"
        ></span>`
        )
        .join('')

      const boxesHtml = day.boxes
        .map((box) => {
          const title = box.event.data?.title ?? box.event.id

          return `
          <div
            data-event-id="${box.event.id}"
            data-continues-before="${box.continuesBefore}"
            data-continues-after="${box.continuesAfter}"
            class="truncate rounded-md bg-event-timed px-1.5 text-[11px] leading-[1.35] font-medium text-event-timed-ink"
            style="position: absolute; overflow: hidden; top: ${percentOf(box.top)}; height: ${percentOf(box.height)}; left: ${percentOf(box.left)}; width: calc(${percentOf(box.width)} - ${BOX_GAP}px); min-height: ${MIN_BOX_HEIGHT}px;"
          >
            ${title}
          </div>`
        })
        .join('')

      return `
      <div
        data-date="${day.date}"
        data-in-current-period="${day.inCurrentPeriod}"
        class="border-l border-hair"
        style="position: relative; height: ${dayHeight}px;"
      >
        ${slotsHtml}
        ${boxesHtml}
      </div>`
    })
    .join('')

  return `
    <div class="sticky top-0 z-10 bg-surface">
      <div
        class="border-b border-line"
        style="display: grid; grid-template-columns: ${colsTemplate};"
      >
        <div></div>
        ${dayHeadingsHtml}
      </div>
      ${allDayHtml}
    </div>

    <div style="overflow-y: auto;">
      <div style="display: grid; grid-template-columns: ${colsTemplate};">
        <div style="position: relative; height: ${dayHeight}px;">
          ${timeLabelsHtml}
        </div>
        ${dayColumnsHtml}
      </div>
    </div>
  `
}
