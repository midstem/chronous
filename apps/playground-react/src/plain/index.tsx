import type { ReactElement } from 'react'

import { Calendar } from '../calendar'

const LANE_HEIGHT = 20

type SlottedProps = {
  hourHeight: number
}

export const PlainSlotted = ({ hourHeight }: SlottedProps): ReactElement => (
  <>
    <div className="sticky top-0 z-10 bg-surface">
      <Calendar.Header className="border-b border-line">
        <Calendar.DayHeadings className="border-l border-hair py-2 text-center text-sm font-medium" />
      </Calendar.Header>

      <Calendar.AllDayRow
        className="border-b border-line"
        gutterCell={
          <span className="pl-2 text-[10px] text-faint">all-day</span>
        }
      >
        <Calendar.AllDayEvents className="truncate rounded bg-tone-2 px-2 text-[11px] leading-6 text-tone-2-ink">
          {({ event }) => event.data?.title}
        </Calendar.AllDayEvents>
      </Calendar.AllDayRow>
    </div>

    <Calendar.TimeGrid hourHeight={hourHeight}>
      <Calendar.TimeAxis>
        <Calendar.TimeLabels className="right-2 text-[10px] text-faint" />
      </Calendar.TimeAxis>

      <Calendar.DayColumns className="border-l border-hair">
        <Calendar.TimeSlots className="border-t border-hair" />

        <Calendar.TimedEvents className="truncate rounded-md bg-tone-1 px-1.5 text-[11px] leading-[1.35] font-medium text-tone-1-ink">
          {({ event }) => event.data?.title}
        </Calendar.TimedEvents>
      </Calendar.DayColumns>
    </Calendar.TimeGrid>
  </>
)

export const PlainMonth = (): ReactElement => (
  <Calendar.MonthGrid>
    <Calendar.MonthRows
      className="border-b border-line last:border-b-0"
      laneHeight={LANE_HEIGHT}
    >
      <Calendar.MonthDays className="min-h-28 border-l border-hair p-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint">
        {({ dayLabel, lanes }) => (
          <>
            <div className="h-7 text-center text-xs font-medium">
              {dayLabel}
            </div>
            <div style={{ height: lanes * LANE_HEIGHT }} />
            <Calendar.MonthTimedEvents className="truncate rounded bg-tone-1 px-1 text-[11px] leading-5 text-tone-1-ink">
              {({ event }) => event.data?.title}
            </Calendar.MonthTimedEvents>
          </>
        )}
      </Calendar.MonthDays>

      <Calendar.MonthAllDayEvents className="truncate rounded bg-tone-2 px-1.5 text-[11px] leading-5 text-tone-2-ink">
        {({ event }) => event.data?.title}
      </Calendar.MonthAllDayEvents>
    </Calendar.MonthRows>
  </Calendar.MonthGrid>
)

export const PlainAgenda = (): ReactElement => (
  <Calendar.AgendaList as="ul" className="divide-y divide-hair">
    <Calendar.AgendaDays as="li" className="flex gap-4 px-4 py-3">
      {({ dayLabel, weekdayLabel }) => (
        <>
          <span className="w-16 shrink-0 text-sm font-semibold">
            {weekdayLabel} {dayLabel}
          </span>

          <span className="flex flex-col gap-1">
            <Calendar.AgendaAllDayEvents as="span" className="text-[13px]">
              {({ event }) => `${event.data?.title} · all-day`}
            </Calendar.AgendaAllDayEvents>

            <Calendar.AgendaTimedEvents as="span" className="text-[13px]">
              {({ event, timeRangeLabel }) =>
                `${event.data?.title} · ${timeRangeLabel}`
              }
            </Calendar.AgendaTimedEvents>
          </span>
        </>
      )}
    </Calendar.AgendaDays>
  </Calendar.AgendaList>
)
