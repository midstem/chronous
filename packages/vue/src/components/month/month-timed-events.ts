import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useMonthDayContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'

export type MonthTimedEventScope<TData = unknown> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type MonthTimedEventsProps = {
  as?: Component | string
}

export const MonthTimedEvents = defineComponent({
  name: 'CalendarMonthTimedEvents',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: MonthTimedEventScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { boxes } = useMonthDayContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return boxes.value.map((box) => {
        const scope: MonthTimedEventScope = { event: box.event, box }

        return h(
          Tag,
          {
            key: `${box.event.id}-${box.startMinute}`,
            'data-event-id': box.event.id,
            ...attrs,
            style: styleOf({}, attrs.style)
          },
          renderSlot(slots.default, scope, box.event.id)
        )
      })
    }
  }
})
