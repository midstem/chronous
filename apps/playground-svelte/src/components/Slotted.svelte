<script lang="ts">
  import type { IsoDate, LocaleId } from '@midstem/chronous-svelte'
  import { createCalendarComponents } from '@midstem/chronous-svelte'
  import {
    ALL_DAY_BAR_GAP,
    ALL_DAY_LABEL,
    ALL_DAY_LANE_HEIGHT,
    BOX_GAP,
    COMPACT_BOX_HEIGHT,
    CONTINUES,
    HOURS_IN_DAY,
    MIN_BOX_HEIGHT,
    MIN_LANES,
    SCROLL_TO_HOUR,
    formatDay,
    formatTime
  } from '@midstem/playground-core'
  import type { EventData } from '@midstem/playground-core'
  const C = createCalendarComponents<EventData>()
  let {
    locale,
    hourHeight,
    today,
    plain
  }: {
    locale: LocaleId
    hourHeight: number
    today: IsoDate | null
    plain: boolean
  } = $props()
  const edge = (shown: boolean): string => (shown ? CONTINUES : '')
</script>

<div class="sticky top-0 z-30 bg-surface">
  <C.Header class="border-b border-line"
    ><C.DayHeadings class="border-l border-hair py-2"
      >{#snippet children({ day, weekdayLabel, dayLabel })}<div
          class="flex flex-col items-center gap-0.5"
          title={formatDay(day.date, locale)}
        >
          <span
            class="text-[10px] font-medium tracking-wide text-muted uppercase"
            >{weekdayLabel}</span
          ><span
            class={day.date === today
              ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
              : 'flex size-7 items-center justify-center text-sm font-semibold'}
            >{dayLabel}</span
          >
        </div>{/snippet}</C.DayHeadings
    ></C.Header
  >
  <C.AllDayRow
    class="border-b border-line pt-0.5 pb-1.5"
    laneHeight={ALL_DAY_LANE_HEIGHT}
    minLanes={MIN_LANES}
  >
    {#snippet gutterCell()}<span
        class="block pt-1 pr-2 text-right text-[10px] text-faint"
        >{ALL_DAY_LABEL}</span
      >{/snippet}
    <C.AllDayEvents gap={ALL_DAY_BAR_GAP} class="px-px py-px"
      >{#snippet children({ event, bar })}<span
          class={`flex h-full items-center truncate rounded-md px-2 text-[11px] font-medium ${plain ? 'border-b border-line' : 'bg-event-all-day text-event-all-day-ink'}`}
          title={event.data?.title ?? event.id}
          >{edge(bar.continuesBefore)}
          {event.data?.title ?? event.id}
          {edge(bar.continuesAfter)}</span
        >{/snippet}</C.AllDayEvents
    >
  </C.AllDayRow>
</div>
<C.TimeGrid {hourHeight} scrollToHour={SCROLL_TO_HOUR}>
  <C.TimeAxis
    ><C.TimeLabels class="right-2 text-[10px] tabular-nums text-faint"
      >{#snippet children({
        minuteOfDay,
        timeLabel
      })}{#if minuteOfDay > 0}{timeLabel}{/if}{/snippet}</C.TimeLabels
    ></C.TimeAxis
  >
  <C.DayColumns class="border-l border-hair"
    ><C.TimeSlots class="border-t border-hair" /><C.NowMarker
      class="border-t-2 border-now"
      ><span class="absolute -top-[5px] -left-1 size-2 rounded-full bg-now"
      ></span></C.NowMarker
    >
    <C.TimedEvents class="hover:z-20" minHeight={MIN_BOX_HEIGHT} gap={BOX_GAP}
      >{#snippet children({ event, box })}<div
          class={`h-full overflow-hidden rounded-md border border-surface px-1.5 py-px text-[11px] leading-[1.35] shadow-sm transition-[filter] hover:brightness-110 ${plain ? 'border-line bg-surface text-ink' : 'bg-event-timed text-event-timed-ink'}`}
          title={`${event.data?.title ?? event.id}\n${formatTime(box.start, locale)} – ${formatTime(box.end, locale)}`}
        >
          <span class="block truncate font-semibold"
            >{edge(box.continuesBefore)}
            {event.data?.title ?? event.id}
            {edge(box.continuesAfter)}</span
          >{#if box.height * hourHeight * HOURS_IN_DAY >= COMPACT_BOX_HEIGHT}<span
              class="block truncate opacity-80"
              >{formatTime(box.start, locale)} – {formatTime(
                box.end,
                locale
              )}</span
            >{/if}
        </div>{/snippet}</C.TimedEvents
    >
  </C.DayColumns>
</C.TimeGrid>
