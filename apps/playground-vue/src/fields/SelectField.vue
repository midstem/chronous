<script setup lang="ts">
import type { Option } from '@midstem/playground-core'

defineProps<{
  label: string
  labelHidden?: boolean
  hint?: string
  value: string
  options: readonly Option[]
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()
</script>

<template>
  <label class="flex flex-col gap-1">
    <span v-if="!labelHidden" class="field-label">{{ label }}</span>
    <select
      class="field-control"
      :value="value"
      @change="emit('update:value', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option of options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <span v-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>
