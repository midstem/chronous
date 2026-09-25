import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import type { RootScope } from '../shared/root'

export type MonthGridProps = {
  as?: Component | string
}

export const MonthGrid = defineComponent({
  name: 'CalendarMonthGrid',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: RootScope) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const scope = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      const layout = {
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '100%'
      }

      const slotScope: RootScope = {
        calendar: scope.calendar.value,
        range: scope.range.value,
        locale: scope.locale.value,
        gutterWidth: scope.gutterWidth.value
      }

      return h(
        Tag,
        {
          ...attrs,
          style: styleOf(layout, attrs.style)
        },
        renderSlot(slots.default, slotScope, null)
      )
    }
  }
})
