import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useDayColumnContext } from '../context'
import { percentOf, renderSlot, styleOf, tagOf } from '../helpers'

const MIN_HEIGHT = 22

const GAP = 3

export type TimedEventScope<TData = unknown> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type TimedEventsProps = {
  as?: Component | string
  minHeight?: number
  gap?: number
}

export const TimedEvents = defineComponent({
  name: 'CalendarTimedEvents',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    minHeight: {
      type: Number,
      default: MIN_HEIGHT
    },
    gap: {
      type: Number,
      default: GAP
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: TimedEventScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { day } = useDayColumnContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return day.value.boxes.map((box) => {
        const layout = {
          position: 'absolute',
          overflow: 'hidden',
          top: percentOf(box.top),
          height: percentOf(box.height),
          left: percentOf(box.left),
          width: `calc(${percentOf(box.width)} - ${props.gap}px)`,
          minHeight: `${props.minHeight}px`
        }

        const scope: TimedEventScope = { event: box.event, box }

        return h(
          Tag,
          {
            key: `${box.event.id}-${box.startMinute}`,
            'data-event-id': box.event.id,
            'data-continues-before': box.continuesBefore,
            'data-continues-after': box.continuesAfter,
            ...attrs,
            style: styleOf(layout, attrs.style)
          },
          renderSlot(slots.default, scope, box.event.id)
        )
      })
    }
  }
})
