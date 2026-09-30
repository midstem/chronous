<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBar, CalendarEntry } from '../../engine.js'
  import { useMonthRowContext } from '../context'
  import { percentOf, styleText, visibleLanes } from '../helpers'
  type MonthAllDayEventScope<T> = {
    event: CalendarEntry<T>
    bar: CalendarBar<T>
  }
  let {
    as = 'div',
    children,
    style,
    gap = 4,
    lanesTopOffset = 28,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthAllDayEventScope<TData>]>
    style?: string | Record<string, string | number>
    gap?: number
    lanesTopOffset?: number
    [key: string]: unknown
  } = $props()
  const context = useMonthRowContext<TData>()
</script>

{#each visibleLanes(context.row.bars, context.maxLanes) as bar (`${bar.event.id}-${bar.startDay}`)}
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
        top: lanesTopOffset + bar.lane * context.laneHeight,
        height: context.laneHeight,
        zIndex: 1
      },
      style
    )}
  >
    {#if children}
      {@render children({ event: bar.event, bar })}
    {:else}
      {bar.event.id}
    {/if}
  </svelte:element>
{/each}
