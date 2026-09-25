<script setup lang="ts">
import { Calendar } from '@midstem/chronous-vue'

const LANE_HEIGHT = 20
</script>

<template>
  <Calendar.MonthGrid>
    <Calendar.MonthRows
      class="border-b border-line last:border-b-0"
      :lane-height="LANE_HEIGHT"
    >
      <Calendar.MonthDays
        class="min-h-28 border-l border-hair p-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
        v-slot="{ dayLabel, lanes }"
      >
        <div class="h-7 text-center text-xs font-medium">{{ dayLabel }}</div>
        <div :style="{ height: `${lanes * LANE_HEIGHT}px` }" />
        <Calendar.MonthTimedEvents
          class="truncate rounded bg-tone-1 px-1 text-[11px] leading-5 text-tone-1-ink"
          v-slot="{ event }"
        >
          {{ event.data?.title }}
        </Calendar.MonthTimedEvents>
      </Calendar.MonthDays>

      <Calendar.MonthAllDayEvents
        class="truncate rounded bg-tone-2 px-1.5 text-[11px] leading-5 text-tone-2-ink"
        v-slot="{ event }"
      >
        {{ event.data?.title }}
      </Calendar.MonthAllDayEvents>
    </Calendar.MonthRows>
  </Calendar.MonthGrid>
</template>
