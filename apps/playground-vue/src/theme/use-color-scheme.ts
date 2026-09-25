import type { ComputedRef, Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  DARK_QUERY,
  applyScheme,
  opposite,
  storedScheme,
  systemScheme
} from '@midstem/playground-core'
import type { Scheme } from '@midstem/playground-core'

export interface ColorSchemeResult {
  pinned: Ref<Scheme | null>
  resolved: ComputedRef<Scheme>
  toggle: () => void
}

export const useColorScheme = (): ColorSchemeResult => {
  const pinned = ref<Scheme | null>(storedScheme())
  const system = ref<Scheme>(systemScheme())

  const resolved = computed<Scheme>(() => pinned.value ?? system.value)

  let media: MediaQueryList | null = null

  const sync = (): void => {
    system.value = systemScheme()
  }

  onMounted(() => {
    media = window.matchMedia(DARK_QUERY)
    media.addEventListener('change', sync)
  })

  onUnmounted(() => {
    media?.removeEventListener('change', sync)
  })

  watch(
    pinned,
    (next) => {
      applyScheme(next)
    },
    { immediate: true }
  )

  const toggle = (): void => {
    pinned.value = pinned.value ? null : opposite(system.value)
  }

  return {
    pinned,
    resolved,
    toggle
  }
}
