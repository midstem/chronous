<script setup lang="ts">
import type { IsoDate, LocaleId } from '@midstem/chronous-vue'
import { Calendar } from '@midstem/chronous-vue'
import {
  ALL_DAY_LABEL,
  EMPTY_LABEL,
  dotOf,
  formatDay
} from '@midstem/playground-core'

defineProps<{
  locale: LocaleId
  today: IsoDate | null
}>()

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
    : 'flex size-7 items-center justify-center text-sm font-semibold'
</script>

<template>
  <Calendar.AgendaList as="ul" class="divide-y divide-hair">
    <Calendar.AgendaDays
      as="li"
      show-empty-days
      class="grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-3 data-[in-current-period=false]:bg-sunken"
      v-slot="{ day, weekdayLabel, dayLabel, bars, boxes }"
    >
      <div
        class="flex items-baseline gap-2"
        :title="formatDay(day.date, locale)"
      >
        <span :class="numberClass(day.date === today)">{{ dayLabel }}</span>
        <span class="text-[11px] tracking-wide text-muted uppercase">
          {{ weekdayLabel }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span
          v-if="bars.length === 0 && boxes.length === 0"
          class="text-[13px] text-faint"
        >
          {{ EMPTY_LABEL }}
        </span>

        <Calendar.AgendaAllDayEvents
          as="span"
          class="flex items-center gap-2 text-[13px]"
          v-slot="{ event }"
        >
          <span :class="['size-2 shrink-0 rounded-full', dotOf(event.id)]" />
          <span class="w-24 shrink-0 text-[11px] text-faint">
            {{ ALL_DAY_LABEL }}
          </span>
          <span class="truncate">
            {{ event.data?.title ?? event.id }}
          </span>
        </Calendar.AgendaAllDayEvents>

        <Calendar.AgendaTimedEvents
          as="span"
          class="flex items-center gap-2 text-[13px]"
          v-slot="{ event, timeRangeLabel }"
        >
          <span :class="['size-2 shrink-0 rounded-full', dotOf(event.id)]" />
          <span
            class="w-24 shrink-0 font-mono text-[11px] tabular-nums text-muted"
          >
            {{ timeRangeLabel }}
          </span>
          <span class="truncate">
            {{ event.data?.title ?? event.id }}
          </span>
        </Calendar.AgendaTimedEvents>
      </div>
    </Calendar.AgendaDays>
  </Calendar.AgendaList>
</template>
