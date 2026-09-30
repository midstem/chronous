<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBar, CalendarEntry } from '../../engine.js'
  import { useAllDayContext } from '../context'
  import { percentOf, styleText } from '../helpers'
  type AllDayEventScope<T> = { event: CalendarEntry<T>; bar: CalendarBar<T> }
  let {
    as = 'div',
    children,
    style,
    gap = 4,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[AllDayEventScope<TData>]>
    style?: string | Record<string, string | number>
    gap?: number
    [key: string]: unknown
  } = $props()
  const context = useAllDayContext<TData>()
</script>

{#each context.row.bars as bar (`${bar.event.id}-${bar.startDay}`)}
  <svelte:element
    this={as}
    data-event-id={bar.event.id}
    data-continues-before={bar.continuesBefore}
    data-continues-after={bar.continuesAfter}
    {...rest}
    style={styleText(
      {
        position: 'absolute',
        left: `calc(${percentOf(bar.left)} + ${gap / 2}px)`,
        width: `calc(${percentOf(bar.width)} - ${gap}px)`,
        top: bar.lane * context.laneHeight,
        height: context.laneHeight
      },
      style
    )}
  >
    {#if children}{@render children({ event: bar.event, bar })}{:else}{bar.event
        .id}{/if}
  </svelte:element>
{/each}
