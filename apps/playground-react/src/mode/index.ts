export type Mode = 'calendar' | 'code'

export const MODES: readonly { value: Mode; label: string }[] = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'code', label: 'Code' }
]

export const DEFAULT_MODE: Mode = 'calendar'
