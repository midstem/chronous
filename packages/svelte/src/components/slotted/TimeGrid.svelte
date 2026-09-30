<script lang="ts">
  import type { Snippet } from 'svelte'
  import { onMount } from 'svelte'
  import { provideTimeGrid, useCalendarContext } from '../context'
  import type { TimeGridContextValue } from '../context'
  import { styleText, templateOf } from '../helpers'
  import { scrollerOf } from './helpers'
  let {
    as = 'div',
    children,
    style,
    hourHeight = 60,
    scrollToHour = 7,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[TimeGridContextValue]>
    style?: string | Record<string, string | number>
    hourHeight?: number
    scrollToHour?: number | null
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext()
  const scope = {
    get hourHeight() {
      return hourHeight
    },
    get dayHeight() {
      return hourHeight * 24
    }
  }
  provideTimeGrid(scope)
  let element: HTMLElement
  let mounted = $state(false)
  onMount(() => {
    mounted = true
  })
  $effect(() => {
    if (!mounted || scrollToHour === null || !element) return
    const scroller = scrollerOf(element)
    if (scroller) scroller.scrollTop = hourHeight * scrollToHour
  })
</script>

<svelte:element
  this={as}
  bind:this={element}
  {...rest}
  style={styleText({ overflowY: 'auto' }, style)}
>
  <div
    style={`display:grid;grid-template-columns:${templateOf(context.gutterWidth, context.calendar.days.length)}`}
  >
    {#if children}{@render children(scope)}{/if}
  </div>
</svelte:element>
