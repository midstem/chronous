import type { CalendarSlot } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext } from '../context'
import {
  CLOCK,
  labelOf,
  minutePercentOf,
  renderSlot,
  styleOf,
  tagOf
} from '../helpers'

export type TimeLabelScope = {
  slot: CalendarSlot
  minuteOfDay: number
  timeLabel: string
}

export type TimeLabelsProps = {
  as?: Component | string
}

export const TimeLabels = defineComponent({
  name: 'CalendarTimeLabels',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: TimeLabelScope) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, locale } = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')
      const day = calendar.value.days[0]

      return day.slots.map((slot) => {
        const timeLabel = labelOf(slot.start, locale.value, CLOCK)
        const scope: TimeLabelScope = {
          slot,
          minuteOfDay: slot.minuteOfDay,
          timeLabel
        }

        const layout = {
          position: 'absolute',
          top: minutePercentOf(slot.minuteOfDay),
          transform: 'translateY(-50%)'
        }

        return h(
          Tag,
          {
            key: slot.minuteOfDay,
            ...attrs,
            style: styleOf(layout, attrs.style)
          },
          renderSlot(slots.default, scope, timeLabel)
        )
      })
    }
  }
})
