import type { Calendar, LocaleId } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { dayLabel, numberLabel, timeLabel, weekdayLabel } from '../labels'
import { dotOf } from '../tone'
import type { EventData } from '../types'

import { ALL_DAY_LABEL, EMPTY_LABEL } from './constants'
import { agendaDays } from './helpers'

type AgendaProps = {
  calendar: Calendar<EventData>
  locale: LocaleId
  today: string | null
}

export const Agenda = ({
  calendar,
  locale,
  today
}: AgendaProps): ReactElement => (
  <ul className="divide-y divide-hair">
    {agendaDays(calendar).map((day) => (
      <li
        key={day.date}
        className={`grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-3 ${day.inPeriod ? '' : 'bg-sunken'}`}
        title={dayLabel(day.date, locale)}
      >
        <div className="flex items-baseline gap-2">
          <span
            className={
              day.date === today
                ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
                : 'flex size-7 items-center justify-center text-sm font-semibold'
            }
          >
            {numberLabel(day.date, locale)}
          </span>
          <span className="text-[11px] tracking-wide text-muted uppercase">
            {weekdayLabel(day.date, locale)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {day.bars.length === 0 && day.boxes.length === 0 && (
            <span className="text-[13px] text-faint">{EMPTY_LABEL}</span>
          )}

          {day.bars.map((bar) => (
            <span
              key={`${bar.event.id}-${bar.startDay}`}
              className="flex items-center gap-2 text-[13px]"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${dotOf(bar.event.id)}`}
              />
              <span className="w-24 shrink-0 text-[11px] text-faint">
                {ALL_DAY_LABEL}
              </span>
              <span className="truncate">
                {bar.event.data?.title ?? bar.event.id}
              </span>
            </span>
          ))}

          {day.boxes.map((box) => (
            <span
              key={`${box.event.id}-${box.startMinute}`}
              className="flex items-center gap-2 text-[13px]"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${dotOf(box.event.id)}`}
              />
              <span className="w-24 shrink-0 font-mono text-[11px] tabular-nums text-muted">
                {timeLabel(box.start, locale)} – {timeLabel(box.end, locale)}
              </span>
              <span className="truncate">
                {box.event.data?.title ?? box.event.id}
              </span>
            </span>
          ))}
        </div>
      </li>
    ))}
  </ul>
)
