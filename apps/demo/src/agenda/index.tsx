import type { IsoDate, LocaleId } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { Calendar } from '../calendar'
import { dayLabel } from '../labels'
import { dotOf } from '../tone'

import { ALL_DAY_LABEL, EMPTY_LABEL } from './constants'

type AgendaProps = {
  locale: LocaleId
  today: IsoDate | null
}

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
    : 'flex size-7 items-center justify-center text-sm font-semibold'

export const Agenda = ({ locale, today }: AgendaProps): ReactElement => (
  <Calendar.AgendaList as="ul" className="divide-y divide-hair">
    <Calendar.AgendaDays
      as="li"
      showEmpty
      className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-3 data-[in-period=false]:bg-sunken"
    >
      {({ day, weekday, dayNumber, bars, boxes }) => (
        <>
          <div
            className="flex items-baseline gap-2"
            title={dayLabel(day.date, locale)}
          >
            <span className={numberClass(day.date === today)}>{dayNumber}</span>
            <span className="text-[11px] tracking-wide text-muted uppercase">
              {weekday}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {bars.length === 0 && boxes.length === 0 && (
              <span className="text-[13px] text-faint">{EMPTY_LABEL}</span>
            )}

            <Calendar.AgendaAllDayEvents
              as="span"
              className="flex items-center gap-2 text-[13px]"
            >
              {({ event }) => (
                <>
                  <span
                    className={`size-2 shrink-0 rounded-full ${dotOf(event.id)}`}
                  />
                  <span className="w-24 shrink-0 text-[11px] text-faint">
                    {ALL_DAY_LABEL}
                  </span>
                  <span className="truncate">
                    {event.data?.title ?? event.id}
                  </span>
                </>
              )}
            </Calendar.AgendaAllDayEvents>

            <Calendar.AgendaTimedEvents
              as="span"
              className="flex items-center gap-2 text-[13px]"
            >
              {({ event, timeRange }) => (
                <>
                  <span
                    className={`size-2 shrink-0 rounded-full ${dotOf(event.id)}`}
                  />
                  <span className="w-24 shrink-0 font-mono text-[11px] tabular-nums text-muted">
                    {timeRange}
                  </span>
                  <span className="truncate">
                    {event.data?.title ?? event.id}
                  </span>
                </>
              )}
            </Calendar.AgendaTimedEvents>
          </div>
        </>
      )}
    </Calendar.AgendaDays>
  </Calendar.AgendaList>
)
