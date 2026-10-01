<script lang="ts">
  import type { IsoDate } from '@midstem/chronous-svelte'
  import { createCalendarComponents } from '@midstem/chronous-svelte'
  import {
    CELL_MIN_HEIGHT,
    CONTINUES,
    MONTH_BAR_GAP,
    MONTH_LANE_HEIGHT,
    MONTH_MAX_LANES,
    NUMBER_HEIGHT,
    WEEK_COLUMNS,
    dotOf,
    toneOf
  } from '@midstem/playground-core'
  import type { EventData } from '@midstem/playground-core'
  const C = createCalendarComponents<EventData>()
  let { today, plain }: { today: IsoDate | null; plain: boolean } = $props()
  const edge = (shown: boolean): string => (shown ? CONTINUES : '')
</script>

<C.MonthGrid
  ><div
    class="grid border-b border-line"
    style={`grid-template-columns:${WEEK_COLUMNS}`}
  >
    <C.MonthWeekdays
      as="span"
      class="border-l border-hair py-1.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase first:border-l-0"
    />
  </div>
  <C.MonthRows
    class="border-b border-line last:border-b-0"
    maxLanes={MONTH_MAX_LANES}
    laneHeight={MONTH_LANE_HEIGHT}
    style={`min-height:${CELL_MIN_HEIGHT}px`}
  >
    <C.MonthDays
      class="flex flex-col border-l border-hair px-1 pb-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
      >{#snippet children({ day, dayLabel, lanes, hiddenBars })}<span
          class="flex items-center justify-center"
          style={`height:${NUMBER_HEIGHT}px`}
          ><span
            class={day.date === today
              ? 'flex size-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-surface'
              : 'flex size-6 items-center justify-center text-xs font-medium'}
            >{dayLabel}</span
          ></span
        ><span class="block" style={`height:${lanes * MONTH_LANE_HEIGHT}px`}
        ></span>{#if hiddenBars.length}<span
            class="px-1 text-[10px] font-medium text-muted"
            >+{hiddenBars.length} more</span
          >{/if}<span class="flex flex-col gap-0.5"
          ><C.MonthTimedEvents
            as="span"
            class="flex items-center gap-1 truncate rounded px-1 text-[11px] leading-5 hover:bg-raised"
            >{#snippet children({ event })}{#if !plain}<span
                  class={`size-1.5 shrink-0 rounded-full ${dotOf(event.id)}`}
                ></span>{/if}<span class="truncate"
                >{event.data?.title ?? event.id}</span
              >{/snippet}</C.MonthTimedEvents
          ></span
        >{/snippet}</C.MonthDays
    >
    <C.MonthAllDayEvents gap={MONTH_BAR_GAP} lanesTopOffset={NUMBER_HEIGHT}
      >{#snippet children({ event, bar })}<span
          class={`flex h-full items-center truncate px-1.5 text-[11px] font-medium ${plain ? 'border-b border-line' : `rounded ${toneOf(event.id)}`}`}
          >{edge(bar.continuesBefore)}
          {event.data?.title ?? event.id}
          {edge(bar.continuesAfter)}</span
        >{/snippet}</C.MonthAllDayEvents
    >
  </C.MonthRows>
</C.MonthGrid>
