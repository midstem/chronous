<script lang="ts">
  import type { IsoDate, LocaleId } from '@midstem/chronous-svelte'
  import { createCalendarComponents } from '@midstem/chronous-svelte'
  import {
    ALL_DAY_LABEL,
    EMPTY_LABEL,
    dotOf,
    formatDay
  } from '@midstem/playground-core'
  import type { EventData } from '@midstem/playground-core'
  const C = createCalendarComponents<EventData>()
  let {
    locale,
    today,
    plain
  }: { locale: LocaleId; today: IsoDate | null; plain: boolean } = $props()
</script>

<C.AgendaList as="ul" class="divide-y divide-hair"
  ><C.AgendaDays
    as="li"
    showEmptyDays
    class="grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-3 data-[in-current-period=false]:bg-sunken"
    >{#snippet children({ day, weekdayLabel, dayLabel, bars, boxes })}<div
        class="flex items-baseline gap-2"
        title={formatDay(day.date, locale)}
      >
        <span
          class="flex size-7 items-center justify-center rounded-full text-sm font-semibold"
          class:today={day.date === today}>{dayLabel}</span
        ><span class="text-[11px] tracking-wide text-muted uppercase"
          >{weekdayLabel}</span
        >
      </div>
      <div class="flex flex-col gap-1">
        {#if bars.length === 0 && boxes.length === 0}<span
            class="text-[13px] text-faint">{EMPTY_LABEL}</span
          >{/if}<C.AgendaAllDayEvents
          as="span"
          class="flex items-center gap-2 text-[13px]"
          >{#snippet children({ event })}{#if !plain}<span
                class={`size-2 shrink-0 rounded-full ${dotOf(event.id)}`}
              ></span>{/if}<span class="w-24 shrink-0 text-[11px] text-faint"
              >{ALL_DAY_LABEL}</span
            ><span class="truncate">{event.data?.title ?? event.id}</span
            >{/snippet}</C.AgendaAllDayEvents
        ><C.AgendaTimedEvents
          as="span"
          class="flex items-center gap-2 text-[13px]"
          >{#snippet children({ event, timeRangeLabel })}{#if !plain}<span
                class={`size-2 shrink-0 rounded-full ${dotOf(event.id)}`}
              ></span>{/if}<span
              class="w-24 shrink-0 font-mono text-[11px] tabular-nums text-muted"
              >{timeRangeLabel}</span
            ><span class="truncate">{event.data?.title ?? event.id}</span
            >{/snippet}</C.AgendaTimedEvents
        >
      </div>{/snippet}</C.AgendaDays
  ></C.AgendaList
>

<style>
  .today {
    background: var(--color-accent);
    color: var(--color-surface);
  }
</style>
