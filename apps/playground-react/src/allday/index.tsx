import type { ReactElement } from 'react'

import { Calendar } from '../calendar'
import { CONTINUES } from '../constants'

import { ALL_DAY_LABEL, BAR_GAP, LANE_HEIGHT, MIN_LANES } from './constants'

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

export const AllDay = (): ReactElement => (
  <Calendar.AllDayRow
    className="border-b border-line pt-0.5 pb-1.5"
    laneHeight={LANE_HEIGHT}
    minLanes={MIN_LANES}
    gutterCell={
      <span className="block pt-1 pr-2 text-right text-[10px] text-faint">
        {ALL_DAY_LABEL}
      </span>
    }
  >
    <Calendar.AllDayEvents gap={BAR_GAP} className="px-px py-px">
      {({ event, bar }) => (
        <span
          className="flex h-full items-center truncate rounded-md bg-event-all-day px-2 text-[11px] font-medium text-event-all-day-ink"
          title={event.data?.title ?? event.id}
        >
          {edge(bar.continuesBefore)}
          {event.data?.title ?? event.id}
          {edge(bar.continuesAfter)}
        </span>
      )}
    </Calendar.AllDayEvents>
  </Calendar.AllDayRow>
)
