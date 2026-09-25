import type { CalendarBar, CalendarBox, CalendarDay } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h } from 'vue'

import {
  provideMonthDayContext,
  useCalendarContext,
  useMonthRowContext
} from '../context'
import type { MonthDayContextValue } from '../context'
import {
  DAY_NUMBER,
  hiddenLanes,
  labelOf,
  laneCount,
  renderSlot,
  rowBarsByDay,
  styleOf,
  tagOf
} from '../helpers'

export const MonthDayProvider = defineComponent({
  name: 'MonthDayProvider',
  props: {
    value: {
      type: Object as PropType<MonthDayContextValue<any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    provideMonthDayContext(props.value)
    return () => slots.default?.()
  }
})

export type MonthDayScope<TData = unknown> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
  bars: CalendarBar<TData>[]
  hiddenBars: CalendarBar<TData>[]
  dayLabel: string
  inCurrentPeriod: boolean
  lanes: number
}

export type MonthDaysProps = {
  as?: Component | string
}

export const MonthDays = defineComponent({
  name: 'CalendarMonthDays',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: MonthDayScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { locale } = useCalendarContext()
    const { row, days, maxLanes } = useMonthRowContext()

    return () => {
      const Tag = tagOf(props.as, 'div')
      const barsByDay = rowBarsByDay(row.value, days.value.length)

      return days.value.map((day, index) => {
        const dayLabel = labelOf(day.date, locale.value, DAY_NUMBER)
        const bars = barsByDay[index]
        const hiddenBars = hiddenLanes(bars, maxLanes.value)

        const scopeVal: MonthDayContextValue = {
          day: computed(() => day),
          boxes: computed(() => day.boxes),
          bars: computed(() => bars),
          hiddenBars: computed(() => hiddenBars)
        }

        const slotScope: MonthDayScope = {
          day,
          boxes: day.boxes,
          bars,
          hiddenBars,
          dayLabel,
          inCurrentPeriod: day.inCurrentPeriod,
          lanes: laneCount(row.value.lanes, maxLanes.value)
        }

        return h(
          MonthDayProvider,
          {
            key: day.date,
            value: scopeVal
          },
          () =>
            h(
              Tag,
              {
                'data-date': day.date,
                'data-in-current-period': day.inCurrentPeriod,
                ...attrs,
                style: styleOf({}, attrs.style)
              },
              renderSlot(slots.default, slotScope, dayLabel)
            )
        )
      })
    }
  }
})
