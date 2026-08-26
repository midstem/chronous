import type { TabId } from './types'

export const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'spec', label: 'Props' },
  { id: 'events', label: 'Events' },
  { id: 'code', label: 'Code' }
]

export const DEFAULT_TAB: TabId = 'spec'
