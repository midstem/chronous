<script setup lang="ts">
import { computed, ref } from 'vue'
import { DEFAULT_MODE, hourHeightOf } from '@midstem/playground-core'
import type { Mode } from '@midstem/playground-core'

import Board from '../board/Board.vue'
import Masthead from '../masthead/Masthead.vue'
import { usePlayground } from '../playground/use-playground'
import Sidebar from '../sidebar/Sidebar.vue'
import Snippet from '../snippet/Snippet.vue'
import { useColorScheme } from '../theme/use-color-scheme'

const playground = usePlayground()
const scheme = useColorScheme()
const mode = ref<Mode>(DEFAULT_MODE)

const { state, range, events } = playground
const hourHeight = computed(() => hourHeightOf(state.value.density))
</script>

<template>
  <div class="flex h-dvh flex-col bg-canvas text-ink">
    <Masthead
      :mode="mode"
      :pinned-scheme="scheme.pinned.value"
      :resolved-scheme="scheme.resolved.value"
      @update:mode="mode = $event"
      @toggle-scheme="scheme.toggle"
      @reset="playground.reset"
    />

    <div
      class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,16rem)_minmax(0,1fr)] lg:grid-cols-[minmax(300px,23vw)_minmax(0,1fr)] lg:grid-rows-1"
    >
      <Sidebar />

      <main class="flex min-h-0 min-w-0 flex-col">
        <Board
          v-if="mode === 'calendar'"
          :range="range"
          :events="events"
          :locale="state.locale"
          :density="state.density"
          :style="state.style"
          @navigate="playground.applyRange"
          @density="playground.update({ density: $event })"
        />

        <Snippet
          v-if="mode === 'code'"
          :range="range"
          :events="events"
          :locale="state.locale"
          :hour-height="hourHeight"
          :style="state.style"
        />
      </main>
    </div>
  </div>
</template>
