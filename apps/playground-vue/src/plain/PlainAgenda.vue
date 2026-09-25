<script setup lang="ts">
import { Calendar } from '@midstem/chronous-vue'
</script>

<template>
  <Calendar.AgendaList as="ul" class="divide-y divide-hair">
    <Calendar.AgendaDays as="li" class="flex gap-4 px-4 py-3" v-slot="{ dayLabel, weekdayLabel }">
      <span class="w-16 shrink-0 text-sm font-semibold">
        {{ weekdayLabel }} {{ dayLabel }}
      </span>

      <span class="flex flex-col gap-1">
        <Calendar.AgendaAllDayEvents as="span" class="text-[13px]" v-slot="{ event }">
          {{ event.data?.title }} · all-day
        </Calendar.AgendaAllDayEvents>

        <Calendar.AgendaTimedEvents as="span" class="text-[13px]" v-slot="{ event, timeRangeLabel }">
          {{ event.data?.title }} · {{ timeRangeLabel }}
        </Calendar.AgendaTimedEvents>
      </span>
    </Calendar.AgendaDays>
  </Calendar.AgendaList>
</template>
