<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { CalendarSlot } from '../../engine.js'
  import { useDayColumnContext } from '../context'
  import { minutePercentOf, styleText } from '../helpers'
  type TimeSlotScope = { slot: CalendarSlot; minuteOfDay: number }
  let {
    as = 'span',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[TimeSlotScope]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useDayColumnContext()
</script>

{#each context.day.slots as slot (slot.minuteOfDay)}<svelte:element
    this={as}
    {...rest}
    style={styleText(
      {
        position: 'absolute',
        left: 0,
        right: 0,
        top: minutePercentOf(slot.minuteOfDay)
      },
      style
    )}
    >{#if children}{@render children({
        slot,
        minuteOfDay: slot.minuteOfDay
      })}{/if}</svelte:element
  >{/each}
