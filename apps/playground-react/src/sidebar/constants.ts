import type { TabId } from './types'

export const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'range', label: 'Options' },
  { id: 'events', label: 'Events' }
]

export const DEFAULT_TAB: TabId = 'range'
