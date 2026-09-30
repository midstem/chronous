<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarDay } from '../../engine.js'
  import { provideDayColumn, useTimeGridContext } from '../context'
  import type { DayColumnContextValue } from '../context'
  import { styleText } from '../helpers'
  let {
    day,
    as = 'div',
    children,
    style,
    ...rest
  }: {
    day: CalendarDay<TData>
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[DayColumnContextValue<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const scope = {
    get day() {
      return day
    }
  }
  provideDayColumn(scope)
  const grid = useTimeGridContext()
</script>

<svelte:element
  this={as}
  data-date={day.date}
  data-in-current-period={day.inCurrentPeriod}
  {...rest}
  style={styleText({ position: 'relative', height: grid.dayHeight }, style)}
  >{#if children}{@render children(scope)}{/if}</svelte:element
>
