<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarDay } from '../../engine.js'
  import { useCalendarContext } from '../context'
  import { WEEKDAY, labelOf, rowsWithDays, styleText } from '../helpers'
  type MonthWeekdayScope<T> = { day: CalendarDay<T>; weekdayLabel: string }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthWeekdayScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
  let first = $derived(rowsWithDays(context.calendar)[0])
</script>

{#each first.days as day (day.date)}{@const weekdayLabel = labelOf(
    day.date,
    context.locale,
    WEEKDAY
  )}<svelte:element this={as} {...rest} style={styleText({}, style)}
    >{#if children}{@render children({
        day,
        weekdayLabel
      })}{:else}{weekdayLabel}{/if}</svelte:element
  >{/each}
