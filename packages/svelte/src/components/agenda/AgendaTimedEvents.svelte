<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarBox, TimedEntry } from '../../engine.js'
  import { useAgendaDayContext, useCalendarContext } from '../context'
  import { rangeOf, styleText } from '../helpers'
  type AgendaTimedEventScope<T> = {
    event: TimedEntry<T>
    box: CalendarBox<T>
    timeRangeLabel: string
  }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[AgendaTimedEventScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const calendarContext = useCalendarContext()
  const dayContext = useAgendaDayContext<TData>()
</script>

{#each dayContext.boxes as box (`${box.event.id}-${box.startMinute}`)}
  {@const timeRangeLabel = rangeOf(box.start, box.end, calendarContext.locale)}
  <svelte:element
    this={as}
    data-event-id={box.event.id}
    data-continues-before={box.continuesBefore}
    data-continues-after={box.continuesAfter}
    {...rest}
    style={styleText({}, style)}
  >
    {#if children}
      {@render children({
        event: box.event,
        box,
        timeRangeLabel
      })}
    {:else}
      {timeRangeLabel}
    {/if}
  </svelte:element>
{/each}
