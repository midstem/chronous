<script setup lang="ts">
import { computed } from 'vue'
import { EVENTS_HINT, ROWS, presetOf } from '@midstem/playground-core'

import { usePlayground } from '../playground/use-playground'

const playground = usePlayground()
const { state, source, problem, events } = playground

const hint = computed(() => presetOf(state.value.preset).hint)
const count = computed(() => events.value.length)

const onInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement
  playground.changeSource(target.value)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-2">
    <p class="text-[11px] leading-4 text-muted">{{ hint }}</p>
    <p class="font-mono text-[10px] text-faint">
      EventInput[] · {{ count }} on the board
    </p>
    <textarea
      :class="[
        'field-control min-h-0 flex-1 resize-none font-mono text-[11px] leading-5',
        problem ? 'border-danger' : ''
      ]"
      aria-label="Events JSON"
      :spellcheck="false"
      :rows="ROWS"
      :value="source"
      @input="onInput"
    />
    <p v-if="problem" role="alert" class="text-[11px] leading-4 text-danger">
      {{ problem }}
    </p>
    <p v-else class="text-[11px] leading-4 text-muted">{{ EVENTS_HINT }}</p>
  </div>
</template>
