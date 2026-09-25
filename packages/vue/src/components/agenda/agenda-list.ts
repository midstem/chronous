import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import type { RootScope } from '../shared/root'

export type AgendaListProps = {
  as?: Component | string
}

export const AgendaList = defineComponent({
  name: 'CalendarAgendaList',
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
          style: styleOf({}, attrs.style)
        },
        renderSlot(slots.default, slotScope, null)
      )
    }
  }
})
