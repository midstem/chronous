import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useAllDayContext } from '../context'
import { percentOf, renderSlot, styleOf, tagOf } from '../helpers'

const GAP = 4

export type AllDayEventScope<TData = unknown> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AllDayEventsProps = {
  as?: Component | string
  gap?: number
}

export const AllDayEvents = defineComponent({
  name: 'CalendarAllDayEvents',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    gap: {
      type: Number,
      default: GAP
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: AllDayEventScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { row, laneHeight } = useAllDayContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return row.value.bars.map((bar) => {
        const layout = {
          position: 'absolute',
          left: `calc(${percentOf(bar.left)} + ${props.gap / 2}px)`,
          width: `calc(${percentOf(bar.width)} - ${props.gap}px)`,
          top: `${bar.lane * laneHeight.value}px`,
          height: `${laneHeight.value}px`
        }

        const scope: AllDayEventScope = { event: bar.event, bar }

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
