<script setup lang="ts">
import { Calendar } from '@midstem/chronous-vue'
import {
  ALL_DAY_BAR_GAP,
  ALL_DAY_LABEL,
  ALL_DAY_LANE_HEIGHT,
  CONTINUES,
  MIN_LANES,
  toneOf
} from '@midstem/playground-core'

const edge = (shown: boolean): string => (shown ? CONTINUES : '')
</script>

<template>
  <Calendar.AllDayRow
    class="border-b border-line pt-0.5 pb-1.5"
    :lane-height="ALL_DAY_LANE_HEIGHT"
    :min-lanes="MIN_LANES"
  >
    <template #gutterCell>
      <span class="block pt-1 pr-2 text-right text-[10px] text-faint">
        {{ ALL_DAY_LABEL }}
      </span>
    </template>

    <Calendar.AllDayEvents
      :gap="ALL_DAY_BAR_GAP"
      class="px-px py-px"
      v-slot="{ event, bar }"
    >
      <span
        :class="[
          'flex h-full items-center truncate rounded-md px-2 text-[11px] font-medium',
          toneOf(event.id)
        ]"
        :title="event.data?.title ?? event.id"
      >
        {{ edge(bar.continuesBefore) }}
        {{ event.data?.title ?? event.id }}
        {{ edge(bar.continuesAfter) }}
      </span>
    </Calendar.AllDayEvents>
  </Calendar.AllDayRow>
</template>
