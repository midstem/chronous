<script setup lang="ts">
import type { IsoDate, LocaleId } from '@midstem/chronous-vue'
import { Calendar } from '@midstem/chronous-vue'
import {
  BOX_GAP,
  COMPACT_BOX_HEIGHT,
  CONTINUES,
  HOURS_IN_DAY,
  MIN_BOX_HEIGHT,
  SCROLL_TO_HOUR,
  formatDay,
  formatTime,
  toneOf
} from '@midstem/playground-core'

import AllDay from '../allday/AllDay.vue'

defineProps<{
  locale: LocaleId
  hourHeight: number
  today: IsoDate | null
}>()

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

const numberClass = (isToday: boolean): string =>
  isToday
    ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
    : 'flex size-7 items-center justify-center text-sm font-semibold'
</script>

<template>
  <div class="sticky top-0 z-30 bg-surface">
    <Calendar.Header class="border-b border-line">
      <Calendar.DayHeadings
        class="border-l border-hair py-2"
        v-slot="{ day, weekdayLabel, dayLabel }"
      >
        <div
          class="flex flex-col items-center gap-0.5"
          :title="formatDay(day.date, locale)"
        >
          <span
            class="text-[10px] font-medium tracking-wide text-muted uppercase"
          >
            {{ weekdayLabel }}
          </span>
          <span :class="numberClass(day.date === today)">
            {{ dayLabel }}
          </span>
        </div>
      </Calendar.DayHeadings>
    </Calendar.Header>

    <AllDay />
  </div>

  <Calendar.TimeGrid
    :hour-height="hourHeight"
    :scroll-to-hour="SCROLL_TO_HOUR"
  >
    <Calendar.TimeAxis>
      <Calendar.TimeLabels
        class="right-2 text-[10px] tabular-nums text-faint"
        v-slot="{ minuteOfDay, timeLabel }"
      >
        <template v-if="minuteOfDay > 0">{{ timeLabel }}</template>
      </Calendar.TimeLabels>
    </Calendar.TimeAxis>

    <Calendar.DayColumns class="border-l border-hair">
      <Calendar.TimeSlots class="border-t border-hair" />

      <Calendar.NowMarker class="border-t-2 border-now">
        <span class="absolute -top-[5px] -left-1 size-2 rounded-full bg-now" />
      </Calendar.NowMarker>

      <Calendar.TimedEvents
        class="hover:z-20"
        :min-height="MIN_BOX_HEIGHT"
        :gap="BOX_GAP"
        v-slot="{ event, box }"
      >
        <div
          :class="[
            'h-full overflow-hidden rounded-md border border-surface px-1.5 py-px text-[11px] leading-[1.35] shadow-sm transition-[filter] hover:brightness-110',
            toneOf(event.id)
          ]"
          :title="`${event.data?.title ?? event.id}\n${formatTime(box.start, locale)} – ${formatTime(box.end, locale)}`"
        >
          <span class="block truncate font-semibold">
            {{ edge(box.continuesBefore) }}
            {{ event.data?.title ?? event.id }}
            {{ edge(box.continuesAfter) }}
          </span>
          <span
            v-if="box.height * hourHeight * HOURS_IN_DAY >= COMPACT_BOX_HEIGHT"
            class="block truncate opacity-80"
          >
            {{ formatTime(box.start, locale) }} – {{ formatTime(box.end, locale) }}
          </span>
        </div>
      </Calendar.TimedEvents>
    </Calendar.DayColumns>
  </Calendar.TimeGrid>
</template>
