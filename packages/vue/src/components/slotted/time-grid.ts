import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h, onMounted, ref } from 'vue'

import { provideTimeGridContext, useCalendarContext } from '../context'
import type { TimeGridContextValue } from '../context'
import {
  HOURS_IN_DAY,
  renderSlot,
  styleOf,
  tagOf,
  templateOf
} from '../helpers'
import { scrollerOf } from './helpers'

const HOUR_HEIGHT = 60

const SCROLL_TO_HOUR = 7

export type TimeGridScope = {
  hourHeight: number
  dayHeight: number
}

export type TimeGridProps = {
  as?: Component | string
  hourHeight?: number
  scrollToHour?: number | null
}

export const TimeGrid = defineComponent({
  name: 'CalendarTimeGrid',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    hourHeight: {
      type: Number,
      default: HOUR_HEIGHT
    },
    scrollToHour: {
      type: Number as PropType<number | null>,
      default: SCROLL_TO_HOUR
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: TimeGridScope) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, gutterWidth } = useCalendarContext()
    const held = ref<HTMLElement | null>(null)

    onMounted(() => {
      if (props.scrollToHour === null || props.scrollToHour === undefined)
        return

      const scroller = scrollerOf(held.value)

      if (scroller) scroller.scrollTop = props.hourHeight * props.scrollToHour
    })

    const hourHeight = computed(() => props.hourHeight)
    const dayHeight = computed(() => props.hourHeight * HOURS_IN_DAY)

    const scope: TimeGridContextValue = {
      hourHeight,
      dayHeight
    }

    provideTimeGridContext(scope)

    return () => {
      const Tag = tagOf(props.as, 'div')

      const slotScope: TimeGridScope = {
        hourHeight: hourHeight.value,
        dayHeight: dayHeight.value
      }

      return h(
        Tag,
        {
          ref: held,
          ...attrs,
          style: styleOf({ overflowY: 'auto' }, attrs.style)
        },
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: templateOf(
                gutterWidth.value,
                calendar.value.days.length
              )
            }
          },
          renderSlot(slots.default, slotScope, null)
        )
      )
    }
  }
})
