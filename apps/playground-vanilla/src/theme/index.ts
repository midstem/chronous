import {
  DARK_QUERY,
  applyScheme,
  opposite,
  storedScheme,
  systemScheme
} from '@midstem/playground-core'
import type { Scheme } from '@midstem/playground-core'

export type ThemeController = {
  getPinned: () => Scheme | null
  getResolved: () => Scheme
  toggle: () => void
  subscribe: (listener: () => void) => () => void
}

export const createThemeController = (): ThemeController => {
  let pinned: Scheme | null = storedScheme()
  let system: Scheme = systemScheme()
  const listeners = new Set<() => void>()

  const notify = (): void => {
    applyScheme(pinned)
    listeners.forEach((fn) => fn())
  }

  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', () => {
    system = systemScheme()
    notify()
  })

  applyScheme(pinned)

  return {
    getPinned: () => pinned,
    getResolved: () => pinned ?? system,
    toggle: () => {
      pinned = pinned ? null : opposite(system)
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}
