import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { computed, defineComponent, h } from 'vue'

import { useCalendar } from '#src/calendar'
import type { CalendarError } from '#src/calendar'

import { provideCalendarContext } from '../context'
import type { CalendarContextValue } from '../context'
import { GUTTER_WIDTH, renderSlot, tagOf } from '../helpers'

const LOCALE: LocaleId = 'en-US'

export type RootScope<TData = unknown> = {
  calendar: CalendarContextValue<TData>['calendar']['value']
  range: CalendarRange
  locale: LocaleId
  gutterWidth: string
}

export type RootProps<TData = unknown> = {
  as?: Component | string
  range: CalendarRange
  events: readonly EventInput<TData>[]
  locale?: LocaleId
  gutterWidth?: string
  renderError?: (error: CalendarError) => VNodeChild
}

export const Root = defineComponent({
  name: 'CalendarRoot',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    range: {
      type: Object as PropType<CalendarRange>,
      required: true
    },
    events: {
      type: Array as PropType<readonly EventInput<any>[]>,
      required: true
    },
    locale: {
      type: String as PropType<LocaleId>,
      default: LOCALE
    },
    gutterWidth: {
      type: String as PropType<string>,
      default: GUTTER_WIDTH
    },
    renderError: {
      type: Function as PropType<(error: CalendarError) => VNodeChild>,
      default: undefined
    }
  },
  slots: Object as SlotsType<{
    default?: (scope: RootScope) => VNodeChild
    error?: (error: CalendarError) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const { calendar, error } = useCalendar(
      () => props.range,
      () => props.events
    )

    const scope: CalendarContextValue = {
      calendar: computed(() => calendar.value!),
      range: computed(() => props.range),
      locale: computed(() => props.locale),
      gutterWidth: computed(() => props.gutterWidth)
    }

    provideCalendarContext(scope)

    return () => {
      const Tag = tagOf(props.as, 'div')

      if (error.value) {
        if (slots.error) {
          return h(Tag, attrs, slots.error(error.value) as any)
        }

        if (props.renderError) {
          return h(Tag, attrs, props.renderError(error.value) as any)
        }

        throw error.value
      }

      const slotScope: RootScope = {
        calendar: calendar.value!,
        range: props.range,
        locale: props.locale,
        gutterWidth: props.gutterWidth
      }

      return h(Tag, attrs, renderSlot(slots.default, slotScope, null))
    }
  }
})
