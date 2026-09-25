import type { CalendarDay, IsoDate } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarContext } from '../context'
import {
  DAY_NUMBER,
  WEEKDAY,
  labelOf,
  renderSlot,
  styleOf,
  tagOf
} from '../helpers'

export type DayHeadingScope<TData = unknown> = {
  day: CalendarDay<TData>
  date: IsoDate
  weekdayLabel: string
  dayLabel: string
  inCurrentPeriod: boolean
}

export type DayHeadingsProps = {
  as?: Component | string
}

export const DayHeadings = defineComponent({
  name: 'CalendarDayHeadings',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: DayHeadingScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, locale } = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return calendar.value.days.map((day) => {
        const weekdayLabel = labelOf(day.date, locale.value, WEEKDAY)
        const dayLabel = labelOf(day.date, locale.value, DAY_NUMBER)

        const scope: DayHeadingScope = {
          day,
          date: day.date,
          weekdayLabel,
          dayLabel,
          inCurrentPeriod: day.inCurrentPeriod
        }

        return h(
          Tag,
          {
            key: day.date,
            'data-date': day.date,
            'data-in-current-period': day.inCurrentPeriod,
            ...attrs,
            style: styleOf({}, attrs.style)
          },
          renderSlot(slots.default, scope, `${weekdayLabel} ${dayLabel}`)
        )
      })
    }
  }
})
