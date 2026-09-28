<script setup lang="ts">
import { useId } from 'vue'
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

const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      :class="
        labelHidden
          ? 'sr-only'
          : 'font-mono text-xs font-semibold tracking-tight text-ink'
      "
      :for="id"
    >
      {{ label }}
    </label>
    <select
      :id="id"
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
    <span v-if="hint" class="text-[11px] leading-4 text-muted">{{ hint }}</span>
  </div>
</template>
