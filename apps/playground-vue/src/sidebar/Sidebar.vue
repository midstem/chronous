<script setup lang="ts">
import { ref } from 'vue'
import { DEFAULT_TAB, TABS } from '@midstem/playground-core'
import type { TabId } from '@midstem/playground-core'

import Controls from '../controls/Controls.vue'
import Events from '../events/Events.vue'

const tab = ref<TabId>(DEFAULT_TAB)
const tabs = TABS
</script>

<template>
  <aside class="flex min-h-0 flex-col border-r border-line bg-raised">
    <div class="flex shrink-0 gap-0.5 border-b border-line px-2 pt-2">
      <button
        v-for="item of tabs"
        :key="item.id"
        type="button"
        :aria-pressed="item.id === tab"
        :class="[
          'rounded-t-md border-b-2 px-3 py-2 text-[13px] font-medium',
          item.id === tab
            ? 'border-accent text-accent'
            : 'border-transparent text-muted hover:text-ink'
        ]"
        @click="tab = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="flex min-h-0 flex-1 flex-col p-3">
      <Controls v-if="tab === 'range'" />
      <Events v-if="tab === 'events'" />
    </div>
  </aside>
</template>
