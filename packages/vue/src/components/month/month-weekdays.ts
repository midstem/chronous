import type { CalendarDay } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext } from '../context'
import {
  WEEKDAY,
  labelOf,
  renderSlot,
  rowsWithDays,
  styleOf,
  tagOf
} from '../helpers'

export type MonthWeekdayScope<TData = unknown> = {
  day: CalendarDay<TData>
  weekdayLabel: string
}

export type MonthWeekdaysProps = {
  as?: Component | string
}

export const MonthWeekdays = defineComponent({
  name: 'CalendarMonthWeekdays',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: MonthWeekdayScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, locale } = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')
      const first = rowsWithDays(calendar.value)[0]

      return first.days.map((day) => {
        const weekdayLabel = labelOf(day.date, locale.value, WEEKDAY)

        const scope: MonthWeekdayScope = {
          day,
          weekdayLabel
        }

        return h(
          Tag,
          {
            key: day.date,
            ...attrs,
            style: styleOf({}, attrs.style)
          },
          renderSlot(slots.default, scope, weekdayLabel)
        )
      })
    }
  }
})
