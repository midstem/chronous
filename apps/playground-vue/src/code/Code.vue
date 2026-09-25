<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  COPIED_LABEL,
  COPIED_MS,
  COPY_LABEL,
  TOKEN_STYLES,
  highlight
} from '@midstem/playground-core'

const props = defineProps<{
  fileName: string
  badge: string
  hint: string
  source: string
}>()

const copied = ref(false)
const tokens = computed(() => highlight(props.source))

const copy = (): void => {
  void navigator.clipboard.writeText(props.source).then(() => {
    copied.value = true
    window.setTimeout(() => (copied.value = false), COPIED_MS)
  })
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col p-4">
    <header class="flex flex-wrap items-center gap-3 pb-3">
      <h2 class="font-mono text-lg font-semibold">{{ fileName }}</h2>
      <span class="font-mono text-[11px] text-faint">{{ badge }}</span>
      <button type="button" class="ghost-button ml-auto" @click="copy">
        {{ copied ? COPIED_LABEL : COPY_LABEL }}
      </button>
    </header>

    <section
      class="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
    >
      <pre
        class="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-5 text-code-plain"
      ><span
        v-for="(token, index) of tokens"
        :key="index"
        :class="TOKEN_STYLES[token.kind]"
      >{{ token.text }}</span></pre>
    </section>

    <p class="pt-2 text-[11px] leading-4 text-muted">{{ hint }}</p>
  </div>
</template>
