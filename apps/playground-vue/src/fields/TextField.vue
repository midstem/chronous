<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  type?: string
  hint?: string
  value: string
  suggestions?: readonly string[]
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
      class="field-control"
      :type="type || 'text'"
      :value="value"
      :list="suggestions ? `${id}-list` : undefined"
      :placeholder="placeholder"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />
    <datalist v-if="suggestions" :id="`${id}-list`">
      <option v-for="item of suggestions" :key="item" :value="item" />
    </datalist>
    <span v-if="hint" class="text-[11px] leading-4 text-muted">{{ hint }}</span>
  </div>
</template>
