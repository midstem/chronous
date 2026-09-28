<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  hint?: string
  value: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      class="font-mono text-xs font-semibold tracking-tight text-ink"
      :for="id"
    >
      {{ label }}
    </label>
    <input
      :id="id"
      type="number"
      class="field-control"
      :value="value"
      :placeholder="placeholder"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="hint" class="text-[11px] leading-4 text-muted">{{ hint }}</span>
  </div>
</template>
