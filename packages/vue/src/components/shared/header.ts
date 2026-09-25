import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext } from '../context'
import { renderSlot, styleOf, tagOf, templateOf } from '../helpers'
import type { RootScope } from './root'

export type HeaderProps = {
  as?: Component | string
  gutterCell?: VNodeChild
}

export const Header = defineComponent({
  name: 'CalendarHeader',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    gutterCell: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: null
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: RootScope) => VNodeChild
    gutterCell?: () => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const scope = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      const layout = {
        display: 'grid',
        gridTemplateColumns: templateOf(
          scope.gutterWidth.value,
          scope.calendar.value.days.length
        )
      }

      const slotScope: RootScope = {
        calendar: scope.calendar.value,
        range: scope.range.value,
        locale: scope.locale.value,
        gutterWidth: scope.gutterWidth.value
      }

      const gutterContent = slots.gutterCell
        ? slots.gutterCell()
        : props.gutterCell

      return h(
        Tag,
        {
          ...attrs,
          style: styleOf(layout, attrs.style)
        },
        [
          h('div', undefined, gutterContent as any),
          renderSlot(slots.default, slotScope, null)
        ]
      )
    }
  }
})
