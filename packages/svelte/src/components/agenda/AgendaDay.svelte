<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBar, CalendarDay } from '../../engine.js'
  import { provideAgendaDay, useCalendarContext } from '../context'
  import type { AgendaDayContextValue } from '../context'
  import { DAY_NUMBER, MONTH, WEEKDAY, labelOf, styleText } from '../helpers'
  type AgendaDayScope<T> = AgendaDayContextValue<T> & {
    weekdayLabel: string
    dayLabel: string
    monthLabel: string
  }
  let {
    day,
    bars,
    as = 'div',
    children,
    style,
    ...rest
  }: {
    day: CalendarDay<TData>
    bars: CalendarBar<TData>[]
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[AgendaDayScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
  const value = {
    get day() {
      return day
    },
    get bars() {
      return bars
    },
    get boxes() {
      return day.boxes
    }
  }
  provideAgendaDay(value)
  const scope = $derived({
    ...value,
    weekdayLabel: labelOf(day.date, context.locale, WEEKDAY),
    dayLabel: labelOf(day.date, context.locale, DAY_NUMBER),
    monthLabel: labelOf(day.date, context.locale, MONTH)
  })
</script>

<svelte:element
  this={as}
  data-date={day.date}
  data-in-current-period={day.inCurrentPeriod}
  {...rest}
  style={styleText({}, style)}
  >{#if children}{@render children(
      scope
    )}{:else}{scope.dayLabel}{/if}</svelte:element
>
