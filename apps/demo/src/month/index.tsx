import type { IsoDate } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { Calendar } from '../calendar'
import { CONTINUES } from '../constants'
import { dotOf, toneOf } from '../tone'

import {
  BAR_GAP,
  CELL_MIN_HEIGHT,
  LANE_HEIGHT,
  NUMBER_HEIGHT,
  WEEK_COLUMNS
} from './constants'

type MonthProps = {
  today: IsoDate | null
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-surface'
    : 'flex size-6 items-center justify-center text-xs font-medium'

export const Month = ({ today }: MonthProps): ReactElement => (
  <Calendar.MonthGrid>
    <div
      className="grid border-b border-line"
      style={{ gridTemplateColumns: WEEK_COLUMNS }}
    >
      <Calendar.MonthWeekdays
        as="span"
        className="border-l border-hair py-1.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase first:border-l-0"
      />
    </div>

    <Calendar.MonthRows
      className="border-b border-line last:border-b-0"
      style={{ minHeight: CELL_MIN_HEIGHT }}
    >
      <Calendar.MonthDays className="flex flex-col border-l border-hair px-1 pb-1 first:border-l-0 data-[in-period=false]:bg-sunken data-[in-period=false]:text-faint">
        {({ day, dayNumber, lanes }) => (
          <>
            <span
              className="flex items-center justify-center"
              style={{ height: NUMBER_HEIGHT }}
            >
              <span className={numberClass(day.date === today)}>
                {dayNumber}
              </span>
            </span>

            <span className="block" style={{ height: lanes * LANE_HEIGHT }} />

            <span className="flex flex-col gap-0.5">
              <Calendar.MonthTimedEvents
                as="span"
                className="flex items-center gap-1 truncate rounded px-1 text-[11px] leading-5 hover:bg-raised"
              >
                {({ event }) => (
                  <>
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${dotOf(event.id)}`}
                    />
                    <span
                      className="truncate"
                      title={event.data?.title ?? event.id}
                    >
                      {event.data?.title ?? event.id}
                    </span>
                  </>
                )}
              </Calendar.MonthTimedEvents>
            </span>
          </>
        )}
      </Calendar.MonthDays>

      <Calendar.MonthAllDayEvents
        laneHeight={LANE_HEIGHT}
        gap={BAR_GAP}
        topOffset={NUMBER_HEIGHT}
      >
        {({ event, bar }) => (
          <span
            className={`flex h-full items-center truncate rounded px-1.5 text-[11px] font-medium ${toneOf(event.id)}`}
            title={event.data?.title ?? event.id}
          >
            {edge(bar.continuesBefore)}
            {event.data?.title ?? event.id}
            {edge(bar.continuesAfter)}
          </span>
        )}
      </Calendar.MonthAllDayEvents>
    </Calendar.MonthRows>
  </Calendar.MonthGrid>
)
