<script setup lang="ts">
import { Calendar } from '@midstem/chronous-vue'

defineProps<{
  hourHeight: number
}>()
</script>

<template>
  <div class="sticky top-0 z-10 bg-surface">
    <Calendar.Header class="border-b border-line">
      <Calendar.DayHeadings
        class="border-l border-hair py-2 text-center text-sm font-medium"
      />
    </Calendar.Header>

    <Calendar.AllDayRow class="border-b border-line">
      <template #gutterCell>
        <span class="pl-2 text-[10px] text-faint">all-day</span>
      </template>

      <Calendar.AllDayEvents
        class="truncate rounded bg-tone-2 px-2 text-[11px] leading-6 text-tone-2-ink"
        v-slot="{ event }"
      >
        {{ event.data?.title }}
      </Calendar.AllDayEvents>
    </Calendar.AllDayRow>
  </div>

  <Calendar.TimeGrid :hour-height="hourHeight">
    <Calendar.TimeAxis>
      <Calendar.TimeLabels class="right-2 text-[10px] text-faint" />
    </Calendar.TimeAxis>

    <Calendar.DayColumns class="border-l border-hair">
      <Calendar.TimeSlots class="border-t border-hair" />

      <Calendar.TimedEvents
        class="truncate rounded-md bg-tone-1 px-1.5 text-[11px] leading-[1.35] font-medium text-tone-1-ink"
        v-slot="{ event }"
      >
        {{ event.data?.title }}
      </Calendar.TimedEvents>
    </Calendar.DayColumns>
  </Calendar.TimeGrid>
</template>
