import type { CalendarBar, CalendarBox, CalendarDay } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h } from 'vue'

import { provideAgendaDayContext, useCalendarContext } from '../context'
import type { AgendaDayContextValue } from '../context'
import {
  DAY_NUMBER,
  MONTH,
  WEEKDAY,
  barsByDay,
  labelOf,
  renderSlot,
  styleOf,
  tagOf
} from '../helpers'

export const AgendaDayProvider = defineComponent({
  name: 'AgendaDayProvider',
  props: {
    value: {
      type: Object as PropType<AgendaDayContextValue<any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    provideAgendaDayContext(props.value)
    return () => slots.default?.()
  }
})

export type AgendaDayScope<TData = unknown> = {
  day: CalendarDay<TData>
  bars: CalendarBar<TData>[]
  boxes: CalendarBox<TData>[]
  weekdayLabel: string
  dayLabel: string
  monthLabel: string
}

export type AgendaDaysProps = {
  as?: Component | string
  showEmptyDays?: boolean
}

export const AgendaDays = defineComponent({
  name: 'CalendarAgendaDays',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    showEmptyDays: {
      type: Boolean,
      default: false
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: AgendaDayScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, locale } = useCalendarContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      const bars = barsByDay(calendar.value)

      return calendar.value.days.map((day, index) => {
        const onDay = bars[index]

        if (
          !props.showEmptyDays &&
          onDay.length === 0 &&
          day.boxes.length === 0
        ) {
          return null
        }

        const scopeVal: AgendaDayContextValue = {
          day: computed(() => day),
          bars: computed(() => onDay),
          boxes: computed(() => day.boxes)
        }

        const weekdayLabel = labelOf(day.date, locale.value, WEEKDAY)
        const dayLabel = labelOf(day.date, locale.value, DAY_NUMBER)
        const monthLabel = labelOf(day.date, locale.value, MONTH)

        const slotScope: AgendaDayScope = {
          day,
          bars: onDay,
          boxes: day.boxes,
          weekdayLabel,
          dayLabel,
          monthLabel
        }

        return h(
          AgendaDayProvider,
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
