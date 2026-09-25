import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useAgendaDayContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'

export type AgendaAllDayEventScope<TData = unknown> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AgendaAllDayEventsProps = {
  as?: Component | string
}

export const AgendaAllDayEvents = defineComponent({
  name: 'CalendarAgendaAllDayEvents',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: AgendaAllDayEventScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { bars } = useAgendaDayContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return bars.value.map((bar) => {
        const scope: AgendaAllDayEventScope = { event: bar.event, bar }

        return h(
          Tag,
          {
            key: `${bar.event.id}-${bar.startDay}`,
            'data-event-id': bar.event.id,
            'data-continues-before': bar.continuesBefore,
            'data-continues-after': bar.continuesAfter,
            ...attrs,
            style: styleOf({}, attrs.style)
          },
          renderSlot(slots.default, scope, bar.event.id)
        )
      })
    }
  }
})
