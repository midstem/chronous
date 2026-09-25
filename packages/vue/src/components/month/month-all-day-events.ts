import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useMonthRowContext } from '../context'
import { percentOf, renderSlot, styleOf, tagOf, visibleLanes } from '../helpers'

const GAP = 4

const LANES_TOP_OFFSET = 28

const Z_INDEX = 1

export type MonthAllDayEventScope<TData = unknown> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type MonthAllDayEventsProps = {
  as?: Component | string
  gap?: number
  lanesTopOffset?: number
}

export const MonthAllDayEvents = defineComponent({
  name: 'CalendarMonthAllDayEvents',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    gap: {
      type: Number,
      default: GAP
    },
    lanesTopOffset: {
      type: Number,
      default: LANES_TOP_OFFSET
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: MonthAllDayEventScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { row, maxLanes, laneHeight } = useMonthRowContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return visibleLanes(row.value.bars, maxLanes.value).map((bar) => {
        const layout = {
          position: 'absolute',
          left: `calc(${percentOf(bar.left)} + ${props.gap / 2}px)`,
          width: `calc(${percentOf(bar.width)} - ${props.gap}px)`,
          top: `${props.lanesTopOffset + bar.lane * laneHeight.value}px`,
          height: `${laneHeight.value}px`,
          zIndex: Z_INDEX
        }

        const scope: MonthAllDayEventScope = { event: bar.event, bar }

        return h(
          Tag,
          {
            key: `${bar.event.id}-${bar.startDay}`,
            'data-event-id': bar.event.id,
            'data-continues-before': bar.continuesBefore,
            'data-continues-after': bar.continuesAfter,
            ...attrs,
            style: styleOf(layout, attrs.style)
          },
          renderSlot(slots.default, scope, bar.event.id)
        )
      })
    }
  }
})
