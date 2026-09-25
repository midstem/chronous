import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useAgendaDayContext, useCalendarContext } from '../context'
import { rangeOf, renderSlot, styleOf, tagOf } from '../helpers'

export type AgendaTimedEventScope<TData = unknown> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
  timeRangeLabel: string
}

export type AgendaTimedEventsProps = {
  as?: Component | string
}

export const AgendaTimedEvents = defineComponent({
  name: 'CalendarAgendaTimedEvents',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: AgendaTimedEventScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { locale } = useCalendarContext()
    const { boxes } = useAgendaDayContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return boxes.value.map((box) => {
        const timeRangeLabel = rangeOf(box.start, box.end, locale.value)
        const scope: AgendaTimedEventScope = {
          event: box.event,
          box,
          timeRangeLabel
        }

        return h(
          Tag,
          {
            key: `${box.event.id}-${box.startMinute}`,
            'data-event-id': box.event.id,
            'data-continues-before': box.continuesBefore,
            'data-continues-after': box.continuesAfter,
            ...attrs,
            style: styleOf({}, attrs.style)
          },
          renderSlot(slots.default, scope, timeRangeLabel)
        )
      })
    }
  }
})
