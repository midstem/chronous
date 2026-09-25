import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useTimeGridContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import type { TimeGridScope } from './time-grid'

export type TimeAxisProps = {
  as?: Component | string
}

export const TimeAxis = defineComponent({
  name: 'CalendarTimeAxis',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: TimeGridScope) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const scope = useTimeGridContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      const slotScope: TimeGridScope = {
        hourHeight: scope.hourHeight.value,
        dayHeight: scope.dayHeight.value
      }

      return h(
        Tag,
        {
          ...attrs,
          style: styleOf(
            { position: 'relative', height: `${scope.dayHeight.value}px` },
            attrs.style
          )
        },
        renderSlot(slots.default, slotScope, null)
      )
    }
  }
})
