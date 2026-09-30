<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import { useCalendarContext } from '../context'
  import DayColumn from './DayColumn.svelte'
  import type { DayColumnContextValue } from '../context'
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[DayColumnContextValue<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
</script>

{#each context.calendar.days as day (day.date)}
  <DayColumn {day} {as} {children} {style} {...rest} />
{/each}
