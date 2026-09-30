<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBox, TimedEntry } from '../../engine.js'
  import { useDayColumnContext } from '../context'
  import { percentOf, styleText } from '../helpers'
  type TimedEventScope<T> = { event: TimedEntry<T>; box: CalendarBox<T> }
  let {
    as = 'div',
    children,
    style,
    minHeight = 22,
    gap = 3,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[TimedEventScope<TData>]>
    style?: string | Record<string, string | number>
    minHeight?: number
    gap?: number
    [key: string]: unknown
  } = $props()
  const context = useDayColumnContext<TData>()
</script>

{#each context.day.boxes as box (`${box.event.id}-${box.startMinute}`)}
  <svelte:element
    this={as}
    data-event-id={box.event.id}
    data-continues-before={box.continuesBefore}
    data-continues-after={box.continuesAfter}
    {...rest}
    style={styleText(
      {
        position: 'absolute',
        overflow: 'hidden',
        top: percentOf(box.top),
        height: percentOf(box.height),
        left: percentOf(box.left),
        width: `calc(${percentOf(box.width)} - ${gap}px)`,
        minHeight
      },
      style
    )}
  >
    {#if children}
      {@render children({ event: box.event, box })}
    {:else}
      {box.event.id}
    {/if}
  </svelte:element>
{/each}
