import type { IsoDate, LocaleId } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { AllDay } from '../allday'
import { Calendar } from '../calendar'
import { CONTINUES } from '../constants'
import { dayLabel, timeLabel } from '../labels'
import { toneOf } from '../tone'

import {
  BOX_GAP,
  COMPACT_BOX_HEIGHT,
  HOURS_IN_DAY,
  MIN_BOX_HEIGHT,
  SCROLL_TO_HOUR
} from './constants'

type SlottedProps = {
  locale: LocaleId
  hourHeight: number
  today: IsoDate | null
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
    : 'flex size-7 items-center justify-center text-sm font-semibold'

export const Slotted = ({
  locale,
  hourHeight,
  today
}: SlottedProps): ReactElement => (
  <>
    <div className="sticky top-0 z-30 bg-surface">
      <Calendar.Header className="border-b border-line">
        <Calendar.DayHeadings className="border-l border-hair py-2">
          {({ day, weekday, dayNumber }) => (
            <div
              className="flex flex-col items-center gap-0.5"
              title={dayLabel(day.date, locale)}
            >
              <span className="text-[10px] font-medium tracking-wide text-muted uppercase">
                {weekday}
              </span>
              <span className={numberClass(day.date === today)}>
                {dayNumber}
              </span>
            </div>
          )}
        </Calendar.DayHeadings>
      </Calendar.Header>

      <AllDay />
    </div>

    <Calendar.TimeGrid hourHeight={hourHeight} scrollToHour={SCROLL_TO_HOUR}>
      <Calendar.TimeAxis>
        <Calendar.TimeLabels className="right-2 text-[10px] tabular-nums text-faint">
          {({ minuteOfDay, time }) => (minuteOfDay > 0 ? time : null)}
        </Calendar.TimeLabels>
      </Calendar.TimeAxis>

      <Calendar.DayColumns className="border-l border-hair">
        <Calendar.TimeSlots className="border-t border-hair" />

        <Calendar.NowMarker className="border-t-2 border-now">
          <span className="absolute -top-[5px] -left-1 size-2 rounded-full bg-now" />
        </Calendar.NowMarker>

        <Calendar.TimedEvents
          className="hover:z-20"
          minHeight={MIN_BOX_HEIGHT}
          gap={BOX_GAP}
        >
          {({ event, box }) => {
            const title = event.data?.title ?? event.id
            const from = timeLabel(box.start, locale)
            const to = timeLabel(box.end, locale)
            const roomy = box.height * hourHeight * HOURS_IN_DAY

            return (
              <div
                className={`h-full overflow-hidden rounded-md border border-surface px-1.5 py-px text-[11px] leading-[1.35] shadow-sm transition-[filter] hover:brightness-110 ${toneOf(event.id)}`}
                title={`${title}\n${from} – ${to}`}
              >
                <span className="block truncate font-semibold">
                  {edge(box.continuesBefore)}
                  {title}
                  {edge(box.continuesAfter)}
                </span>
                {roomy >= COMPACT_BOX_HEIGHT && (
                  <span className="block truncate opacity-80">
                    {from} – {to}
                  </span>
                )}
              </div>
            )
          }}
        </Calendar.TimedEvents>
      </Calendar.DayColumns>
    </Calendar.TimeGrid>
  </>
)

export { GUTTER } from './constants'
