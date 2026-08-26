import type { Calendar, LocaleId } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { CONTINUES, PERCENT } from '../constants'
import { numberLabel, weekdayLabel } from '../labels'
import { rowsWithDays } from '../rows'
import { dotOf, toneOf } from '../tone'
import type { EventData } from '../types'

import {
  BAR_INSET,
  CELL_MIN_HEIGHT,
  LANE_HEIGHT,
  NUMBER_HEIGHT
} from './constants'

type MonthProps = {
  calendar: Calendar<EventData>
  locale: LocaleId
  today: string | null
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

export const Month = ({
  calendar,
  locale,
  today
}: MonthProps): ReactElement => {
  const rows = rowsWithDays(calendar)

  return (
    <div className="flex min-h-full flex-col">
      <div
        className="grid border-b border-line"
        style={{
          gridTemplateColumns: `repeat(${rows[0].days.length}, minmax(0, 1fr))`
        }}
      >
        {rows[0].days.map((day) => (
          <span
            key={day.date}
            className="border-l border-hair py-1.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase first:border-l-0"
          >
            {weekdayLabel(day.date, locale)}
          </span>
        ))}
      </div>

      {rows.map(({ row, days }) => (
        <div
          key={row.start}
          className="relative flex-1 border-b border-line last:border-b-0"
          style={{ minHeight: CELL_MIN_HEIGHT }}
        >
          <div
            className="grid h-full"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`
            }}
          >
            {days.map((day) => (
              <div
                key={day.date}
                className={`flex flex-col border-l border-hair px-1 pb-1 first:border-l-0 ${day.inPeriod ? '' : 'bg-sunken text-faint'}`}
              >
                <span
                  className="flex items-center justify-center"
                  style={{ height: NUMBER_HEIGHT }}
                >
                  <span
                    className={
                      day.date === today
                        ? 'flex size-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-surface'
                        : 'flex size-6 items-center justify-center text-xs font-medium'
                    }
                  >
                    {numberLabel(day.date, locale)}
                  </span>
                </span>
                <span
                  className="block"
                  style={{ height: row.lanes * LANE_HEIGHT }}
                />
                <span className="flex flex-col gap-0.5">
                  {day.boxes.map((box) => (
                    <span
                      key={`${box.event.id}-${box.top}`}
                      className="flex items-center gap-1 truncate rounded px-1 text-[11px] leading-5 hover:bg-raised"
                      title={box.event.data?.title ?? box.event.id}
                    >
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${dotOf(box.event.id)}`}
                      />
                      <span className="truncate">
                        {box.event.data?.title ?? box.event.id}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: NUMBER_HEIGHT,
              height: row.lanes * LANE_HEIGHT
            }}
          >
            {row.bars.map((bar) => (
              <div
                key={`${bar.event.id}-${bar.startDay}`}
                className={`absolute truncate rounded px-1.5 text-[11px] leading-[18px] font-medium ${toneOf(bar.event.id)}`}
                style={{
                  left: `calc(${bar.left * PERCENT}% + ${BAR_INSET}px)`,
                  width: `calc(${bar.width * PERCENT}% - ${BAR_INSET * 2}px)`,
                  top: bar.lane * LANE_HEIGHT
                }}
              >
                {edge(bar.continuesBefore)}
                {bar.event.data?.title ?? bar.event.id}
                {edge(bar.continuesAfter)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
