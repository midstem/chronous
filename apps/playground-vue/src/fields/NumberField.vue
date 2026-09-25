<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  value: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()
</script>

<template>
  <label class="flex flex-col gap-1">
    <span class="field-label">{{ label }}</span>
    <input
      type="number"
      class="field-control"
      :value="value"
      :placeholder="placeholder"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>
