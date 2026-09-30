<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import { useMonthRowContext } from '../context'
  import type { MonthDayScope } from '../types'
  import MonthDay from './MonthDay.svelte'
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthDayScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useMonthRowContext<TData>()
</script>

{#each context.days as day, index (day.date)}
  <MonthDay {day} {index} {as} {children} {style} {...rest} />
{/each}
