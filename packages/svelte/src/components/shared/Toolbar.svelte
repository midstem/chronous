<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { CalendarRange, ViewKind } from '../../engine.js'
  import { calendarNavigation } from '../../navigation'
  import { useCalendarContext } from '../context'
  import { styleText } from '../helpers'
  import { titleOf } from './helpers'
  import type { ToolbarScope } from '../types'
  let {
    as = 'div',
    children,
    onNavigate,
    views = ['day', 'week', 'month', 'agenda'],
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[ToolbarScope]>
    onNavigate: (range: CalendarRange) => void
    views?: readonly ViewKind[]
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext()
  let range = $derived(context.range)
  let navigation = $derived(calendarNavigation(range))
  let title = $derived(titleOf(range, context.locale))
</script>

<svelte:element this={as} {...rest} style={styleText({}, style)}>
  {#if children}{@render children({
      navigation,
      range,
      title,
      goTo: onNavigate
    })}{:else}
    <button
      type="button"
      aria-label="Previous period"
      disabled={!navigation.prev}
      onclick={() => navigation.prev && onNavigate(navigation.prev)}>‹</button
    >
    <button
      type="button"
      disabled={!navigation.today}
      onclick={() => navigation.today && onNavigate(navigation.today())}
      >Today</button
    >
    <button
      type="button"
      aria-label="Next period"
      disabled={!navigation.next}
      onclick={() => navigation.next && onNavigate(navigation.next)}>›</button
    >
    <span>{title}</span>
    {#each views as view}<button
        type="button"
        aria-pressed={view === range.view}
        onclick={() => onNavigate(navigation.withView(view))}>{view}</button
      >{/each}
  {/if}
</svelte:element>
