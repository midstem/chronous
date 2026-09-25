import type { CalendarRow } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h } from 'vue'

import { provideAllDayContext, useCalendarContext } from '../context'
import type { AllDayContextValue } from '../context'
import { renderSlot, styleOf, tagOf, templateOf } from '../helpers'

const LANE_HEIGHT = 24

const MIN_LANES = 0

export type AllDayScope<TData = unknown> = {
  row: CalendarRow<TData>
  laneHeight: number
  lanes: number
}

export type AllDayRowProps = {
  as?: Component | string
  laneHeight?: number
  minLanes?: number
  gutterCell?: VNodeChild
}

export const AllDayRow = defineComponent({
  name: 'CalendarAllDayRow',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    laneHeight: {
      type: Number,
      default: LANE_HEIGHT
    },
    minLanes: {
      type: Number,
      default: MIN_LANES
    },
    gutterCell: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: null
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: AllDayScope<any>) => VNodeChild
    gutterCell?: () => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, gutterWidth } = useCalendarContext()

    const row = computed(() => calendar.value.rows[0])
    const lanes = computed(() => Math.max(row.value.lanes, props.minLanes))

    const scope: AllDayContextValue = {
      row,
      laneHeight: computed(() => props.laneHeight),
      lanes
    }

    provideAllDayContext(scope)

    return () => {
      const currentLanes = lanes.value

      if (currentLanes === 0) return null

      const Tag = tagOf(props.as, 'div')

      const layout = {
        display: 'grid',
        gridTemplateColumns: templateOf(
          gutterWidth.value,
          calendar.value.days.length
        )
      }

      const slotScope: AllDayScope = {
        row: row.value,
        laneHeight: props.laneHeight,
        lanes: currentLanes
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
          h(
            'div',
            {
              style: {
                gridColumn: '2 / -1',
                position: 'relative',
                height: `${currentLanes * props.laneHeight}px`
              }
            },
            renderSlot(slots.default, slotScope, null)
          )
        ]
      )
    }
  }
})
