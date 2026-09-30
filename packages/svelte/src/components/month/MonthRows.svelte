<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import { useCalendarContext } from '../context'
  import type { MonthRowContextValue } from '../context'
  import { rowsWithDays } from '../helpers'
  import MonthRow from './MonthRow.svelte'
  let {
    as = 'div',
    children,
    style,
    maxLanes = null,
    laneHeight = 20,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthRowContextValue<TData>]>
    style?: string | Record<string, string | number>
    maxLanes?: number | null
    laneHeight?: number
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
  let rows = $derived(rowsWithDays(context.calendar))
</script>

{#each rows as item (item.row.start)}
  <MonthRow
    row={item.row}
    days={item.days}
    {maxLanes}
    {laneHeight}
    {as}
    {children}
    {style}
    {...rest}
  />
{/each}
