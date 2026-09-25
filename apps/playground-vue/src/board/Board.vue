<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous-vue'
import { Calendar, useCalendarNavigation, useNow } from '@midstem/chronous-vue'
import {
  GUTTER,
  MONTH_VIEW,
  hourHeightOf,
  isSimple,
  isSlotted,
  titleOf
} from '@midstem/playground-core'
import type { Density, EventData, Style } from '@midstem/playground-core'

import Agenda from '../agenda/Agenda.vue'
import Slotted from '../grid/Slotted.vue'
import Month from '../month/Month.vue'
import PlainAgenda from '../plain/PlainAgenda.vue'
import PlainMonth from '../plain/PlainMonth.vue'
import PlainSlotted from '../plain/PlainSlotted.vue'
import State from '../state/State.vue'
import Toolbar from '../toolbar/Toolbar.vue'

const props = defineProps<{
  range: CalendarRange
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  density: Density
  style: Style
}>()

const emit = defineEmits<{
  (e: 'navigate', range: CalendarRange): void
  (e: 'density', density: Density): void
}>()

const navigation = useCalendarNavigation(() => props.range)
const now = useNow(() => props.range.timeZone)
const today = computed(() => now.value?.date ?? null)
const hourHeight = computed(() => hourHeightOf(props.density))
const plain = computed(() => isSimple(props.style))
</script>

<template>
  <Calendar.Root
    :range="range"
    :events="events"
    :locale="locale"
    :gutter-width="GUTTER"
    class="flex min-h-0 flex-1 flex-col p-4"
  >
    <template #error="error">
      <Toolbar
        :navigation="navigation.value"
        :title="range.currentDate"
        :view="range.view"
        :density="density"
        :slotted="isSlotted(range.view)"
        @navigate="emit('navigate', $event)"
        @density="emit('density', $event)"
      />
      <p
        role="alert"
        class="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        <strong class="font-mono">{{ error.name }}</strong>: {{ error.message }}
      </p>
    </template>

    <template #default="{ calendar }">
      <Toolbar
        :navigation="navigation.value"
        :title="titleOf(calendar, locale)"
        :view="range.view"
        :density="density"
        :slotted="isSlotted(range.view)"
        @navigate="emit('navigate', $event)"
        @density="emit('density', $event)"
      />

      <section
        class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
      >
        <div data-scroller class="min-h-0 flex-1 overflow-auto">
          <template v-if="isSlotted(range.view)">
            <PlainSlotted v-if="plain" :hour-height="hourHeight" />
            <Slotted
              v-else
              :locale="locale"
              :hour-height="hourHeight"
              :today="today"
            />
          </template>
          <template v-else-if="range.view === MONTH_VIEW">
            <PlainMonth v-if="plain" />
            <Month v-else :today="today" />
          </template>
          <template v-else>
            <PlainAgenda v-if="plain" />
            <Agenda v-else :locale="locale" :today="today" />
          </template>
        </div>

        <State :calendar="calendar" />
      </section>
    </template>
  </Calendar.Root>
</template>
