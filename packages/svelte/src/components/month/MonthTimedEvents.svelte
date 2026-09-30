<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBox, TimedEntry } from '../../engine.js'
  import { useMonthDayContext } from '../context'
  import { styleText } from '../helpers'
  type MonthTimedEventScope<T> = { event: TimedEntry<T>; box: CalendarBox<T> }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthTimedEventScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useMonthDayContext<TData>()
</script>

{#each context.boxes as box (`${box.event.id}-${box.startMinute}`)}
  <svelte:element
    this={as}
    data-event-id={box.event.id}
    {...rest}
    style={styleText({}, style)}
  >
    {#if children}
      {@render children({ event: box.event, box })}
    {:else}
      {box.event.id}
    {/if}
  </svelte:element>
{/each}
