<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { CalendarNow } from './use-now'
  import { useCalendarContext, useDayColumnContext } from '../context'
  import { minutePercentOf, styleText } from '../helpers'
  import { useNow } from './use-now'
  type NowMarkerScope = { minuteOfDay: number }
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[NowMarkerScope]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const calendarContext = useCalendarContext()
  const dayContext = useDayColumnContext()
  let now = $state<CalendarNow | null>(null)
  $effect(() =>
    useNow(calendarContext.range.timeZone).subscribe((value) => {
      now = value
    })
  )
</script>

{#if now && now.date === dayContext.day.date}<svelte:element
    this={as}
    {...rest}
    style={styleText(
      {
        position: 'absolute',
        left: 0,
        right: 0,
        top: minutePercentOf(now.minuteOfDay),
        zIndex: 10
      },
      style
    )}
    >{#if children}{@render children({
        minuteOfDay: now.minuteOfDay
      })}{/if}</svelte:element
  >{/if}
