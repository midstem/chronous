import type { CalendarSlot } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useDayColumnContext } from '../context'
import { minutePercentOf, renderSlot, styleOf, tagOf } from '../helpers'

export type TimeSlotScope = {
  slot: CalendarSlot
  minuteOfDay: number
}

export type TimeSlotsProps = {
  as?: Component | string
}

export const TimeSlots = defineComponent({
  name: 'CalendarTimeSlots',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'span'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: TimeSlotScope) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { day } = useDayColumnContext()

    return () => {
      const Tag = tagOf(props.as, 'span')

      return day.value.slots.map((slot) => {
        const layout = {
          position: 'absolute',
          left: 0,
          right: 0,
          top: minutePercentOf(slot.minuteOfDay)
        }

        const scope: TimeSlotScope = {
          slot,
          minuteOfDay: slot.minuteOfDay
        }

        return h(
          Tag,
          {
            key: slot.minuteOfDay,
            ...attrs,
            style: styleOf(layout, attrs.style)
          },
          renderSlot(slots.default, scope, null)
        )
      })
    }
  }
})
