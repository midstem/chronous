import type { CalendarRow } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { CONTINUES, PERCENT } from '../constants'
import { templateOf } from '../grid'
import { toneOf } from '../tone'
import type { EventData } from '../types'

import { ALL_DAY_LABEL, LANE_HEIGHT, LANE_PAD, MIN_LANES } from './constants'

type AllDayProps = {
  row: CalendarRow<EventData>
  columns: number
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

export const AllDay = ({ row, columns }: AllDayProps): ReactElement => (
  <div
    className="grid border-b border-line"
    style={{ gridTemplateColumns: templateOf(columns) }}
  >
    <div className="pt-1 pr-2 text-right text-[10px] text-faint">
      {ALL_DAY_LABEL}
    </div>
    <div
      className="relative"
      style={{
        gridColumn: '2 / -1',
        height: Math.max(row.lanes, MIN_LANES) * LANE_HEIGHT + LANE_PAD
      }}
    >
      {row.bars.map((bar) => (
        <div
          key={`${bar.event.id}-${bar.startDay}`}
          className={`absolute truncate rounded-md px-2 text-[11px] leading-5 font-medium ${toneOf(bar.event.id)}`}
          style={{
            left: `calc(${bar.left * PERCENT}% + 2px)`,
            width: `calc(${bar.width * PERCENT}% - 5px)`,
            top: bar.lane * LANE_HEIGHT + 2
          }}
          title={bar.event.data?.title ?? bar.event.id}
        >
          {edge(bar.continuesBefore)}
          {bar.event.data?.title ?? bar.event.id}
          {edge(bar.continuesAfter)}
        </div>
      ))}
    </div>
  </div>
)
