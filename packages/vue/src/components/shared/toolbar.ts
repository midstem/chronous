import type { CalendarRange, ViewKind } from '@midstem/chronous'
import type { Component, PropType, SlotsType, VNodeChild } from 'vue'
import { defineComponent, h } from 'vue'

import { useCalendarNavigation } from '#src/navigation'
import type { CalendarNavigation } from '#src/navigation'

import { useCalendarContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import { titleOf } from './helpers'

const VIEWS: readonly ViewKind[] = ['day', 'week', 'month', 'agenda']

export type ToolbarScope = {
  navigation: CalendarNavigation
  range: CalendarRange
  title: string
  goTo: (range: CalendarRange) => void
}

export type ToolbarProps = {
  as?: Component | string
  onNavigate?: (range: CalendarRange) => void
  views?: readonly ViewKind[]
}

export const Toolbar = defineComponent({
  name: 'CalendarToolbar',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<Component | string>,
      default: 'div'
    },
    onNavigate: {
      type: Function as PropType<(range: CalendarRange) => void>,
      default: undefined
    },
    views: {
      type: Array as PropType<readonly ViewKind[]>,
      default: () => VIEWS
    }
  },
  emits: ['navigate'],
  slots: Object as SlotsType<{
    default?: (scope: ToolbarScope) => VNodeChild
  }>,
  setup(props, { emit, slots, attrs }) {
    const { range, locale } = useCalendarContext()
    const navigation = useCalendarNavigation(() => range.value)

    const goTo = (target: CalendarRange): void => {
      emit('navigate', target)
      props.onNavigate?.(target)
    }

    return () => {
      const Tag = tagOf(props.as, 'div')
      const title = titleOf(range.value, locale.value)
      const currentRange = range.value

      const toolbarAttrs = {
        ...attrs,
        style: styleOf({}, attrs.style)
      }

      if (slots.default) {
        return h(
          Tag,
          toolbarAttrs,
          renderSlot(
            slots.default,
            {
              navigation: navigation.value,
              range: currentRange,
              title,
              goTo
            },
            null
          )
        )
      }

      const prevRange = navigation.prev.value
      const nextRange = navigation.next.value
      const todayFn = navigation.today.value

      return h(Tag, toolbarAttrs, [
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Previous period',
            disabled: !prevRange,
            onClick: () => prevRange && goTo(prevRange)
          },
          '‹'
        ),
        h(
          'button',
          {
            type: 'button',
            disabled: !todayFn,
            onClick: () => todayFn && goTo(todayFn())
          },
          'Today'
        ),
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Next period',
            disabled: !nextRange,
            onClick: () => nextRange && goTo(nextRange)
          },
          '›'
        ),
        h('span', null, title),
        ...props.views.map((view) =>
          h(
            'button',
            {
              key: view,
              type: 'button',
              'aria-pressed': view === currentRange.view ? 'true' : 'false',
              onClick: () => goTo(navigation.withView(view))
            },
            view
          )
        )
      ])
    }
  }
})
