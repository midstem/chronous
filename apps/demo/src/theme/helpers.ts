import {
  DARK_QUERY,
  META_SELECTOR,
  STORAGE_KEY,
  SYSTEM_CONTENT
} from './constants'
import type { Scheme } from './types'

const isScheme = (value: unknown): value is Scheme =>
  value === 'light' || value === 'dark'

export const opposite = (scheme: Scheme): Scheme =>
  scheme === 'dark' ? 'light' : 'dark'

export const systemScheme = (): Scheme =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'

export const storedScheme = (): Scheme | null => {
  const held = localStorage.getItem(STORAGE_KEY)

  return isScheme(held) ? held : null
}

export const applyScheme = (pinned: Scheme | null): void => {
  const meta = document.querySelector<HTMLMetaElement>(META_SELECTOR)

  if (meta) meta.content = pinned ?? SYSTEM_CONTENT

  document.documentElement.style.colorScheme = pinned ?? SYSTEM_CONTENT

  if (pinned) localStorage.setItem(STORAGE_KEY, pinned)
  else localStorage.removeItem(STORAGE_KEY)
}
