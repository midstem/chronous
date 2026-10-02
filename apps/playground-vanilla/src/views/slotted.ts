import type { CalendarLayout, IsoDate, LocaleId } from '@midstem/chronous'
import {
  ALL_DAY_BAR_GAP,
  ALL_DAY_LABEL,
  ALL_DAY_LANE_HEIGHT,
  BOX_GAP,
  COMPACT_BOX_HEIGHT,
  GUTTER,
  HOURS_IN_DAY,
  MIN_BOX_HEIGHT,
  formatDay,
  formatNumber,
  formatTime,
  formatWeekday
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import type { CalendarNow } from './helpers'
import { edge, escapeHtml, minutePercentOf, percentOf } from './helpers'

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
    : 'flex size-7 items-center justify-center text-sm font-semibold'

export const renderSlotted = (
  calendar: CalendarLayout<EventData>,
  locale: LocaleId,
  hourHeight: number,
  today: IsoDate | null,
  now: CalendarNow | null
): string => {
  const days = calendar.days
  const dayHeight = hourHeight * HOURS_IN_DAY
  const row = calendar.rows[0]
  const lanes = Math.max(row?.lanes ?? 0, 1)
  const colsTemplate = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`

  const dayHeadingsHtml = days
    .map((day) => {
      const isToday = day.date === today
      const weekdayLabel = formatWeekday(day.date, locale)
      const dayLabel = formatNumber(day.date, locale)

      return `
      <div
        data-date="${day.date}"
        data-in-current-period="${day.inCurrentPeriod}"
        class="border-l border-hair py-2"
      >
        <div
          class="flex flex-col items-center gap-0.5"
          title="${formatDay(day.date, locale)}"
        >
          <span class="text-[10px] font-medium tracking-wide text-muted uppercase">
            ${weekdayLabel}
          </span>
          <span class="${numberClass(isToday)}">
            ${dayLabel}
          </span>
        </div>
      </div>`
    })
    .join('')

  const allDayHtml =
    lanes > 0 && row
      ? `
      <div
        class="border-b border-line pt-0.5 pb-1.5"
        style="display: grid; grid-template-columns: ${colsTemplate};"
      >
        <div>
          <span class="block pt-1 pr-2 text-right text-[10px] text-faint">
            ${ALL_DAY_LABEL}
          </span>
        </div>
        <div style="grid-column: 2 / -1; position: relative; height: ${lanes * ALL_DAY_LANE_HEIGHT}px;">
          ${row.bars
            .map((bar) => {
              const title = escapeHtml(
                String(bar.event.data?.title ?? bar.event.id)
              )
              return `
            <div
              data-event-id="${escapeHtml(bar.event.id)}"
              data-continues-before="${bar.continuesBefore}"
              data-continues-after="${bar.continuesAfter}"
              class="px-px py-px"
              style="position: absolute; left: calc(${percentOf(bar.left)} + ${ALL_DAY_BAR_GAP / 2}px); width: calc(${percentOf(bar.width)} - ${ALL_DAY_BAR_GAP}px); top: ${bar.lane * ALL_DAY_LANE_HEIGHT}px; height: ${ALL_DAY_LANE_HEIGHT}px;"
            >
              <span
                class="flex h-full items-center truncate rounded-md bg-event-all-day px-2 text-[11px] font-medium text-event-all-day-ink"
                title="${title}"
              >
                ${edge(bar.continuesBefore)}${title}${edge(bar.continuesAfter)}
              </span>
            </div>`
            })
            .join('')}
        </div>
      </div>`
      : ''

  const firstDay = days[0]
  const timeLabelsHtml = firstDay
    ? firstDay.slots
        .filter((slot) => slot.minuteOfDay > 0)
        .map((slot) => {
          const timeLabel = formatTime(slot.start, locale)
          return `
          <div
            class="right-2 text-[10px] tabular-nums text-faint"
            style="position: absolute; top: ${minutePercentOf(slot.minuteOfDay)}; transform: translateY(-50%);"
          >
            ${timeLabel}
          </div>`
        })
        .join('')
    : ''

  const dayColumnsHtml = days
    .map((day) => {
      const isToday = now !== null && now.date === day.date

      const slotsHtml = day.slots
        .map(
          (slot) => `
        <span
          class="border-t border-hair"
          style="position: absolute; left: 0; right: 0; top: ${minutePercentOf(slot.minuteOfDay)};"
        ></span>`
        )
        .join('')

      const nowMarkerHtml = isToday
        ? `
        <div
          class="border-t-2 border-now"
          style="position: absolute; left: 0; right: 0; top: ${minutePercentOf(now.minuteOfDay)}; z-index: 10;"
        >
          <span class="absolute -top-[5px] -left-1 size-2 rounded-full bg-now"></span>
        </div>`
        : ''

      const boxesHtml = day.boxes
        .map((box) => {
          const title = escapeHtml(
            String(box.event.data?.title ?? box.event.id)
          )
          const from = formatTime(box.start, locale)
          const to = formatTime(box.end, locale)
          const roomy = box.height * hourHeight * HOURS_IN_DAY

          return `
          <div
            data-event-id="${escapeHtml(box.event.id)}"
            data-continues-before="${box.continuesBefore}"
            data-continues-after="${box.continuesAfter}"
            class="hover:z-20"
            style="position: absolute; overflow: hidden; top: ${percentOf(box.top)}; height: ${percentOf(box.height)}; left: ${percentOf(box.left)}; width: calc(${percentOf(box.width)} - ${BOX_GAP}px); min-height: ${MIN_BOX_HEIGHT}px;"
          >
            <div
              class="h-full overflow-hidden rounded-md border border-surface bg-event-timed px-1.5 py-px text-[11px] leading-[1.35] text-event-timed-ink shadow-sm transition-[filter] hover:brightness-110"
              title="${title}&#10;${from} – ${to}"
            >
              <span class="block truncate font-semibold">
                ${edge(box.continuesBefore)}${title}${edge(box.continuesAfter)}
              </span>
              ${
                roomy >= COMPACT_BOX_HEIGHT
                  ? `<span class="block truncate opacity-80">${from} – ${to}</span>`
                  : ''
              }
            </div>
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
        ${nowMarkerHtml}
        ${boxesHtml}
      </div>`
    })
    .join('')

  return `
    <div class="sticky top-0 z-30 bg-surface">
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
