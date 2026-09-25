import type { CalendarDay, CalendarRow } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h } from 'vue'

import { provideMonthRowContext, useCalendarContext } from '../context'
import type { MonthRowContextValue } from '../context'
import { columnsOf, renderSlot, rowsWithDays, styleOf, tagOf } from '../helpers'

const MAX_LANES = null

const LANE_HEIGHT = 20

export const MonthRowProvider = defineComponent({
  name: 'MonthRowProvider',
  props: {
    value: {
      type: Object as PropType<MonthRowContextValue<any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    provideMonthRowContext(props.value)
    return () => slots.default?.()
  }
})

export type MonthRowScope<TData = unknown> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
  maxLanes: number | null
  laneHeight: number
}

export type MonthRowsProps = {
  as?: Component | string
  maxLanes?: number | null
  laneHeight?: number
}

export const MonthRows = defineComponent({
  name: 'CalendarMonthRows',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    maxLanes: {
      type: Number as PropType<number | null>,
      default: MAX_LANES
    },
    laneHeight: {
      type: Number,
      default: LANE_HEIGHT
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: MonthRowScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar } = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return rowsWithDays(calendar.value).map(({ row, days }) => {
        const scopeVal: MonthRowContextValue = {
          row: computed(() => row),
          days: computed(() => days),
          maxLanes: computed(() => props.maxLanes),
          laneHeight: computed(() => props.laneHeight)
        }

        const slotScope: MonthRowScope = {
          row,
          days,
          maxLanes: props.maxLanes,
          laneHeight: props.laneHeight
        }

        const layout = {
          position: 'relative',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: columnsOf(days.length)
        }

        return h(
          MonthRowProvider,
          {
            key: row.start,
            value: scopeVal
          },
          () =>
            h(
              Tag,
              {
                ...attrs,
                style: styleOf(layout, attrs.style)
              },
              renderSlot(slots.default, slotScope, null)
            )
        )
      })
    }
  }
})
