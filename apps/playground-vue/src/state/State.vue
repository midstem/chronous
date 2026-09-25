<script setup lang="ts">
import { ref } from 'vue'
import type { CalendarLayout } from '@midstem/chronous-vue'
import { STATE_HINT, jsonOf, summaryOf } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

defineProps<{
  calendar: CalendarLayout<EventData>
}>()

const open = ref(false)
</script>

<template>
  <details
    class="shrink-0 border-t border-line bg-raised"
    @toggle="open = ($event.target as HTMLDetailsElement).open"
  >
    <summary
      class="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-muted"
    >
      <span
        v-for="item of summaryOf(calendar)"
        :key="item.label"
        class="flex items-baseline gap-1"
      >
        <span class="text-faint">{{ item.label }}</span>
        <span class="font-mono text-ink">{{ item.value }}</span>
      </span>
    </summary>
    <div class="flex flex-col gap-2 px-3 pb-3">
      <p class="text-[11px] text-muted">{{ STATE_HINT }}</p>
      <pre
        v-if="open"
        class="max-h-80 overflow-auto rounded-md bg-sunken p-3 font-mono text-[11px] leading-5"
      >{{ jsonOf(calendar) }}</pre>
    </div>
  </details>
</template>
