<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import { provideAllDay, useCalendarContext } from '../context'
  import type { AllDayContextValue } from '../context'
  import { styleText, templateOf } from '../helpers'
  let {
    as = 'div',
    children,
    style,
    laneHeight = 24,
    minLanes = 0,
    gutterCell,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[AllDayContextValue<TData>]>
    style?: string | Record<string, string | number>
    laneHeight?: number
    minLanes?: number
    gutterCell?: Snippet
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
  let row = $derived(context.calendar.rows[0])
  let lanes = $derived(Math.max(row.lanes, minLanes))
  const scope = {
    get row() {
      return row
    },
    get laneHeight() {
      return laneHeight
    },
    get lanes() {
      return lanes
    }
  }
  provideAllDay(scope)
  let css = $derived(
    styleText(
      {
        display: 'grid',
        gridTemplateColumns: templateOf(
          context.gutterWidth,
          context.calendar.days.length
        )
      },
      style
    )
  )
</script>

{#if lanes > 0}
  <svelte:element this={as} {...rest} style={css}>
    <div>
      {#if gutterCell}{@render gutterCell()}{/if}
    </div>
    <div
      style={`grid-column:2 / -1;position:relative;height:${lanes * laneHeight}px`}
    >
      {#if children}{@render children(scope)}{/if}
    </div>
  </svelte:element>
{/if}
