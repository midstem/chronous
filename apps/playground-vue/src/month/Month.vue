<script setup lang="ts">
import type { IsoDate } from '@midstem/chronous-vue'
import { Calendar } from '@midstem/chronous-vue'
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

defineProps<{
  today: IsoDate | null
}>()

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-surface'
    : 'flex size-6 items-center justify-center text-xs font-medium'
</script>

<template>
  <Calendar.MonthGrid>
    <div
      class="grid border-b border-line"
      :style="{ gridTemplateColumns: WEEK_COLUMNS }"
    >
      <Calendar.MonthWeekdays
        as="span"
        class="border-l border-hair py-1.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase first:border-l-0"
      />
    </div>

    <Calendar.MonthRows
      class="border-b border-line last:border-b-0"
      :max-lanes="MONTH_MAX_LANES"
      :lane-height="MONTH_LANE_HEIGHT"
      :style="{ minHeight: `${CELL_MIN_HEIGHT}px` }"
    >
      <Calendar.MonthDays
        class="flex flex-col border-l border-hair px-1 pb-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
        v-slot="{ day, dayLabel, lanes, hiddenBars }"
      >
        <span
          class="flex items-center justify-center"
          :style="{ height: `${NUMBER_HEIGHT}px` }"
        >
          <span :class="numberClass(day.date === today)">
            {{ dayLabel }}
          </span>
        </span>

        <span class="block" :style="{ height: `${lanes * MONTH_LANE_HEIGHT}px` }" />

        <span
          v-if="hiddenBars.length > 0"
          class="px-1 text-[10px] font-medium text-muted"
        >
          +{{ hiddenBars.length }} more
        </span>

        <span class="flex flex-col gap-0.5">
          <Calendar.MonthTimedEvents
            as="span"
            class="flex items-center gap-1 truncate rounded px-1 text-[11px] leading-5 hover:bg-raised"
            v-slot="{ event }"
          >
            <span :class="['size-1.5 shrink-0 rounded-full', dotOf(event.id)]" />
            <span class="truncate" :title="event.data?.title ?? event.id">
              {{ event.data?.title ?? event.id }}
            </span>
          </Calendar.MonthTimedEvents>
        </span>
      </Calendar.MonthDays>

      <Calendar.MonthAllDayEvents
        :gap="MONTH_BAR_GAP"
        :lanes-top-offset="NUMBER_HEIGHT"
        v-slot="{ event, bar }"
      >
        <span
          :class="[
            'flex h-full items-center truncate rounded px-1.5 text-[11px] font-medium',
            toneOf(event.id)
          ]"
          :title="event.data?.title ?? event.id"
        >
          {{ edge(bar.continuesBefore) }}
          {{ event.data?.title ?? event.id }}
          {{ edge(bar.continuesAfter) }}
        </span>
      </Calendar.MonthAllDayEvents>
    </Calendar.MonthRows>
  </Calendar.MonthGrid>
</template>
