<script setup lang="ts">
import { computed } from 'vue'
import { DARK_LABEL, LIGHT_LABEL, opposite } from '@midstem/playground-core'
import type { Scheme } from '@midstem/playground-core'

const props = defineProps<{
  pinned: Scheme | null
  resolved: Scheme
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const next = computed(() => opposite(props.resolved))
</script>

<template>
  <button
    type="button"
    class="ghost-button"
    :aria-pressed="pinned !== null"
    :title="pinned ? 'Follow the system setting' : `Pin the ${next} theme`"
    @click="emit('toggle')"
  >
    <span aria-hidden="true">{{ resolved === 'dark' ? '☾' : '☀' }}</span>
    {{ resolved === 'dark' ? DARK_LABEL : LIGHT_LABEL }}
  </button>
</template>
