import type { CalendarDay } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h } from 'vue'

import {
  provideDayColumnContext,
  useCalendarContext,
  useTimeGridContext
} from '../context'
import type { DayColumnContextValue } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'

export const DayColumnProvider = defineComponent({
  name: 'DayColumnProvider',
  props: {
    value: {
      type: Object as PropType<DayColumnContextValue<any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    provideDayColumnContext(props.value)
    return () => slots.default?.()
  }
})

export type DayColumnScope<TData = unknown> = {
  day: CalendarDay<TData>
}

export type DayColumnsProps = {
  as?: Component | string
}

export const DayColumns = defineComponent({
  name: 'CalendarDayColumns',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: DayColumnScope<any>) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar } = useCalendarContext()
    const { dayHeight } = useTimeGridContext()

    return () => {
      const Tag = tagOf(props.as, 'div')

      return calendar.value.days.map((day) => {
        const scopeVal: DayColumnContextValue = {
          day: computed(() => day)
        }

        const layout = {
          position: 'relative',
          height: `${dayHeight.value}px`
        }

        return h(
          DayColumnProvider,
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
                style: styleOf(layout, attrs.style)
              },
              renderSlot(slots.default, { day }, null)
            )
        )
      })
    }
  }
})
