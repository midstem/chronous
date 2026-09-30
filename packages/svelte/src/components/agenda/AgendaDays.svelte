<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import { useCalendarContext } from '../context'
  import type { AgendaDayScope } from '../types'
  import { barsByDay } from '../helpers'
  import AgendaDay from './AgendaDay.svelte'
  let {
    as = 'div',
    children,
    style,
    showEmptyDays = false,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[AgendaDayScope<TData>]>
    style?: string | Record<string, string | number>
    showEmptyDays?: boolean
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
  let bars = $derived(barsByDay(context.calendar))
</script>

{#each context.calendar.days as day, index (day.date)}
  {@const dayBars = bars[index] ?? []}
  {#if showEmptyDays || dayBars.length > 0 || day.boxes.length > 0}
    <AgendaDay {day} bars={dayBars} {as} {children} {style} {...rest} />
  {/if}
{/each}
