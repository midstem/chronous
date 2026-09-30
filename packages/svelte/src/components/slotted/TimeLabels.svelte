<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { CalendarSlot } from '../../engine.js'
  import { useCalendarContext } from '../context'
  import { CLOCK, labelOf, minutePercentOf, styleText } from '../helpers'
  type TimeLabelScope = {
    slot: CalendarSlot
    minuteOfDay: number
    timeLabel: string
  }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[TimeLabelScope]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext()
  let day = $derived(context.calendar.days[0])
</script>

{#each day.slots as slot (slot.minuteOfDay)}
  {@const timeLabel = labelOf(slot.start, context.locale, CLOCK)}
  <svelte:element
    this={as}
    {...rest}
    style={styleText(
      {
        position: 'absolute',
        top: minutePercentOf(slot.minuteOfDay),
        transform: 'translateY(-50%)'
      },
      style
    )}
    >{#if children}{@render children({
        slot,
        minuteOfDay: slot.minuteOfDay,
        timeLabel
      })}{:else}{timeLabel}{/if}</svelte:element
  >
{/each}
