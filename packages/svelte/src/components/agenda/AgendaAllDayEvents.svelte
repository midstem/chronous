<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBar, CalendarEntry } from '../../engine.js'
  import { useAgendaDayContext } from '../context'
  import { styleText } from '../helpers'
  type AgendaAllDayEventScope<T> = {
    event: CalendarEntry<T>
    bar: CalendarBar<T>
  }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[AgendaAllDayEventScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useAgendaDayContext<TData>()
</script>

{#each context.bars as bar (`${bar.event.id}-${bar.startDay}`)}
  <svelte:element
    this={as}
    data-event-id={bar.event.id}
    data-continues-before={bar.continuesBefore}
    data-continues-after={bar.continuesAfter}
    {...rest}
    style={styleText({}, style)}
  >
    {#if children}
      {@render children({ event: bar.event, bar })}
    {:else}
      {bar.event.id}
    {/if}
  </svelte:element>
{/each}
