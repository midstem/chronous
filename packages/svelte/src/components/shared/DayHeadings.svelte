<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarDay, IsoDate } from '../../engine.js'
  import { useCalendarContext } from '../context'
  import { DAY_NUMBER, WEEKDAY, labelOf, styleText } from '../helpers'
  type DayHeadingScope<T> = {
    day: CalendarDay<T>
    date: IsoDate
    weekdayLabel: string
    dayLabel: string
    inCurrentPeriod: boolean
  }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[DayHeadingScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
</script>

{#each context.calendar.days as day (day.date)}
  {@const weekdayLabel = labelOf(day.date, context.locale, WEEKDAY)}
  {@const dayLabel = labelOf(day.date, context.locale, DAY_NUMBER)}
  <svelte:element
    this={as}
    data-date={day.date}
    data-in-current-period={day.inCurrentPeriod}
    {...rest}
    style={styleText({}, style)}
  >
    {#if children}
      {@render children({
        day,
        date: day.date,
        weekdayLabel,
        dayLabel,
        inCurrentPeriod: day.inCurrentPeriod
      })}
    {:else}
      {weekdayLabel} {dayLabel}
    {/if}
  </svelte:element>
{/each}
