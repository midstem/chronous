<script setup lang="ts">
import {
  DOCS_LABEL,
  FRAMEWORK_NAV_LABEL,
  HEADLINE,
  MODES,
  MODE_LABEL,
  REPOSITORY_URL,
  RESET_LABEL,
  TAGLINE,
  getFrameworkLinks
} from '@midstem/playground-core'
import type { Mode, Scheme } from '@midstem/playground-core'

import RuntimeDialog from '../runtime/RuntimeDialog.vue'
import SchemeToggle from '../theme/SchemeToggle.vue'

defineProps<{
  mode: Mode
  pinnedScheme: Scheme | null
  resolvedScheme: Scheme
}>()

const emit = defineEmits<{
  (e: 'update:mode', mode: Mode): void
  (e: 'toggleScheme'): void
  (e: 'reset'): void
}>()

const frameworks = getFrameworkLinks('vue')
</script>

<template>
  <header
    class="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5"
  >
    <h1 class="flex items-baseline gap-2 text-base font-semibold">
      {{ HEADLINE }}
      <span class="text-xs font-normal text-faint">{{ TAGLINE }}</span>
    </h1>

    <nav
      class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
      :aria-label="FRAMEWORK_NAV_LABEL"
    >
      <a
        v-for="link of frameworks"
        :key="link.id"
        :href="link.href"
        :aria-current="link.isCurrent ? 'page' : undefined"
        :class="[
          'rounded px-3 py-1 text-[13px] font-medium no-underline transition-colors',
          link.isCurrent
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:text-ink'
        ]"
      >
        {{ link.title }}
      </a>
    </nav>

    <div
      class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
      role="group"
      :aria-label="MODE_LABEL"
    >
      <button
        v-for="option of MODES"
        :key="option.value"
        type="button"
        :aria-pressed="option.value === mode"
        :class="[
          'rounded px-3 py-1 text-[13px] font-medium',
          option.value === mode
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:text-ink'
        ]"
        @click="emit('update:mode', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="ml-auto flex flex-wrap items-center gap-2">
      <RuntimeDialog />
      <SchemeToggle
        :pinned="pinnedScheme"
        :resolved="resolvedScheme"
        @toggle="emit('toggleScheme')"
      />
      <button type="button" class="ghost-button" @click="emit('reset')">
        {{ RESET_LABEL }}
      </button>
      <a
        class="ghost-button"
        :href="REPOSITORY_URL"
        target="_blank"
        rel="noreferrer"
      >
        {{ DOCS_LABEL }}
      </a>
    </div>
  </header>
</template>
