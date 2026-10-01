<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import type { Option } from '@midstem/playground-core'

const props = defineProps<{
  label: string
  hint?: string
  value: string
  options: readonly string[]
  optionLabels?: readonly Option[]
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const id = useId()
const customValue = '__custom__'
const customMode = ref(!props.options.includes(props.value))
let internalUpdate = false

watch(
  () => props.value,
  (value) => {
    if (!internalUpdate) customMode.value = !props.options.includes(value)
    internalUpdate = false
  }
)

const onSelect = (event: Event): void => {
  const selected = (event.target as HTMLSelectElement).value
  if (selected === customValue) {
    customMode.value = true
    return
  }
  customMode.value = false
  internalUpdate = true
  emit('update:value', selected)
}

const onInput = (event: Event): void => {
  internalUpdate = true
  emit('update:value', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      class="font-mono text-xs font-semibold tracking-tight text-ink"
      :for="id"
    >
      {{ label }}
    </label>
    <select
      :id="id"
      class="field-control"
      :aria-label="`${label} common values`"
      :value="customMode ? customValue : value"
      @change="onSelect"
    >
      <option v-for="option of options" :key="option" :value="option">
        {{
          optionLabels?.find((item) => item.value === option)?.label ?? option
        }}
      </option>
      <option :value="customValue">Custom value…</option>
    </select>
    <input
      v-if="customMode"
      class="field-control"
      type="text"
      :aria-label="`${label} custom value`"
      :placeholder="`Enter ${label}`"
      :value="value"
      @input="onInput"
    />
    <span v-if="hint" class="text-[11px] leading-4 text-muted">{{ hint }}</span>
  </div>
</template>
