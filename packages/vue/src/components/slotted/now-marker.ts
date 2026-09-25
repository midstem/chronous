import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext, useDayColumnContext } from '../context'
import { minutePercentOf, renderSlot, styleOf, tagOf } from '../helpers'
import { useNow } from './use-now'

const Z_INDEX = 10

export type NowMarkerScope = {
  minuteOfDay: number
}

export type NowMarkerProps = {
  as?: Component | string
}

export const NowMarker = defineComponent({
  name: 'CalendarNowMarker',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: NowMarkerScope) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { range } = useCalendarContext()
    const { day } = useDayColumnContext()
    const now = useNow(() => range.value.timeZone)

    return () => {
      const currentNow = now.value

      if (!currentNow || currentNow.date !== day.value.date) return null

      const Tag = tagOf(props.as, 'div')

      const layout = {
        position: 'absolute',
        left: 0,
        right: 0,
        top: minutePercentOf(currentNow.minuteOfDay),
        zIndex: Z_INDEX
      }

      const scope: NowMarkerScope = {
        minuteOfDay: currentNow.minuteOfDay
      }

      return h(
        Tag,
        {
          ...attrs,
          style: styleOf(layout, attrs.style)
        },
        renderSlot(slots.default, scope, null)
      )
    }
  }
})
