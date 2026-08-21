import type { Calendar, LocaleId, TimeZoneId } from '@midstem/chronous'
import type { CSSProperties, ReactElement } from 'react'

import { CONTINUES, PERCENT } from '../constants'
import { numberLabel } from '../labels'
import type { EventData } from '../app/types'

import { LANE_HEIGHT, NUMBER_HEIGHT } from './constants'
import { rowsWithDays } from './helpers'

type LanesProps = {
  calendar: Calendar<EventData>
  locale: LocaleId
  timeZone: TimeZoneId
  withCells: boolean
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

export const Lanes = ({
  calendar,
  locale,
  timeZone,
  withCells
}: LanesProps): ReactElement => (
  <div className={withCells ? 'lanes' : 'lanes lanes-gutter'}>
    {rowsWithDays(calendar).map(({ row, days }) => (
      <div
        className="row"
        key={row.start}
        style={
          {
            '--lanes': row.lanes,
            '--lane-height': `${LANE_HEIGHT}px`,
            '--number-height': `${withCells ? NUMBER_HEIGHT : 0}px`,
            '--columns': days.length
          } as CSSProperties
        }
      >
        {withCells && (
          <div className="cells">
            {days.map((day) => (
              <div
                className={day.inPeriod ? 'cell' : 'cell cell-outside'}
                key={day.date}
              >
                <span className="cell-number">
                  {numberLabel(day.start, locale, timeZone)}
                </span>
                <span className="cell-lanes" />
                <span className="chips">
                  {day.boxes.map((box) => (
                    <span className="chip" key={`${box.event.id}-${box.top}`}>
                      {box.event.data?.title}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="bars">
          {row.bars.map((bar) => (
            <div
              className="bar"
              key={`${bar.event.id}-${bar.startDay}`}
              style={{
                left: `${bar.left * PERCENT}%`,
                width: `${bar.width * PERCENT}%`,
                top: `${bar.lane * LANE_HEIGHT}px`
              }}
            >
              {edge(bar.continuesBefore)}
              {bar.event.data?.title}
              {edge(bar.continuesAfter)}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)
