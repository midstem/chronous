<script setup lang="ts">
defineProps<{
  label: string
  type?: string
  hint?: string
  value: string
  suggestions?: readonly string[]
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()
</script>

<template>
  <label class="flex flex-col gap-1">
    <span class="field-label">{{ label }}</span>
    <input
      class="field-control"
      :type="type || 'text'"
      :value="value"
      :list="suggestions ? `${label}-list` : undefined"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />
    <datalist v-if="suggestions" :id="`${label}-list`">
      <option v-for="item of suggestions" :key="item" :value="item" />
    </datalist>
    <span v-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>
