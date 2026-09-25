<script setup lang="ts">
import type {
  CalendarNavigation,
  CalendarRange,
  ViewKind
} from '@midstem/chronous-vue'
import {
  BACK_LABEL,
  DENSITIES,
  DENSITY_LABEL,
  NEXT_LABEL,
  VIEWS
} from '@midstem/playground-core'
import type { Density } from '@midstem/playground-core'

defineProps<{
  navigation: CalendarNavigation
  title: string
  view: ViewKind
  density: Density
  slotted: boolean
}>()

const emit = defineEmits<{
  (e: 'navigate', range: CalendarRange): void
  (e: 'density', density: Density): void
}>()
</script>

<template>
  <header class="flex flex-wrap items-center gap-3 pb-3">
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="ghost-button"
        :aria-label="BACK_LABEL"
        :disabled="!navigation.prev"
        @click="navigation.prev && emit('navigate', navigation.prev)"
      >
        ‹
      </button>
      <button
        type="button"
        class="ghost-button"
        :disabled="!navigation.today"
        @click="navigation.today && emit('navigate', navigation.today())"
      >
        Today
      </button>
      <button
        type="button"
        class="ghost-button"
        :aria-label="NEXT_LABEL"
        :disabled="!navigation.next"
        @click="navigation.next && emit('navigate', navigation.next)"
      >
        ›
      </button>
    </div>

    <h2 class="mr-auto truncate text-lg font-semibold">{{ title }}</h2>

    <div
      v-if="slotted"
      class="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
      role="group"
      :aria-label="DENSITY_LABEL"
    >
      <button
        v-for="option of DENSITIES"
        :key="option.value"
        type="button"
        :aria-pressed="option.value === density"
        :class="[
          'rounded px-2 py-1 text-xs font-medium',
          option.value === density
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:text-ink'
        ]"
        @click="emit('density', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div
      class="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
    >
      <button
        v-for="kind of VIEWS"
        :key="kind"
        type="button"
        :aria-pressed="kind === view"
        :class="[
          'rounded px-2.5 py-1 text-xs font-medium capitalize',
          kind === view
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:text-ink'
        ]"
        @click="emit('navigate', navigation.withView(kind))"
      >
        {{ kind }}
      </button>
    </div>
  </header>
</template>
