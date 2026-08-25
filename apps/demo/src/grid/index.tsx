import type { CalendarDay, LocaleId } from '@midstem/chronous'
import type { CSSProperties, ReactElement } from 'react'

import { CONTINUES, PERCENT } from '../constants'
import { dayLabel, timeLabel } from '../labels'
import type { EventData } from '../app/types'

import { DAY_HEIGHT } from './constants'
import { wallTimeOn } from './helpers'

type GridProps = {
  days: readonly CalendarDay<EventData>[]
  locale: LocaleId
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

export const Grid = ({ days, locale }: GridProps): ReactElement => (
  <div
    className="grid"
    style={
      {
        '--day-height': `${DAY_HEIGHT}px`,
        '--columns': days.length
      } as CSSProperties
    }
  >
    <div className="gutter">
      <div className="gutter-head" />
      <div className="gutter-body">
        {days[0].slots.map((slot) => (
          <div className="gutter-slot" key={slot.minuteOfDay}>
            {timeLabel(wallTimeOn(days[0].date, slot.minuteOfDay), locale)}
          </div>
        ))}
      </div>
    </div>
    <div className="columns">
      {days.map((day) => (
        <div className="column" key={day.date}>
          <div className="column-head">{dayLabel(day.date, locale)}</div>
          <div className="column-body">
            {day.slots.map((slot) => (
              <div className="slot" key={slot.minuteOfDay} />
            ))}
            {day.boxes.map((box) => (
              <div
                className="box"
                key={`${box.event.id}-${box.startMinute}`}
                style={{
                  top: `${box.top * PERCENT}%`,
                  height: `${box.height * PERCENT}%`,
                  left: `${box.left * PERCENT}%`,
                  width: `${box.width * PERCENT}%`
                }}
              >
                <span className="box-title">
                  {edge(box.continuesBefore)}
                  {box.event.data?.title}
                  {edge(box.continuesAfter)}
                </span>
                <span className="box-time">{timeLabel(box.start, locale)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)
