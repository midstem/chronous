<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarDay, CalendarRow } from '../../engine.js'
  import { provideMonthRow } from '../context'
  import type { MonthRowContextValue } from '../context'
  import { columnsOf, styleText } from '../helpers'
  let {
    row,
    days,
    maxLanes = null,
    laneHeight = 20,
    as = 'div',
    children,
    style,
    ...rest
  }: {
    row: CalendarRow<TData>
    days: CalendarDay<TData>[]
    maxLanes?: number | null
    laneHeight?: number
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthRowContextValue<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const scope = {
    get row() {
      return row
    },
    get days() {
      return days
    },
    get maxLanes() {
      return maxLanes
    },
    get laneHeight() {
      return laneHeight
    }
  }
  provideMonthRow(scope)
</script>

<svelte:element
  this={as}
  {...rest}
  style={styleText(
    {
      position: 'relative',
      flex: 1,
      display: 'grid',
      gridTemplateColumns: columnsOf(days.length)
    },
    style
  )}
  >{#if children}{@render children(scope)}{/if}</svelte:element
>
