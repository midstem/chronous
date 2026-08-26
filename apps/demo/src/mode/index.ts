export type Mode = 'calendar' | 'code' | 'simple'

export const MODES: readonly { value: Mode; label: string }[] = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'code', label: 'Code' },
  { value: 'simple', label: 'Simple' }
]

export const DEFAULT_MODE: Mode = 'calendar'
