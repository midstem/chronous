import type { RuntimeState } from './types'

type TemporalCarrier = { Temporal?: unknown }

export const runtimeStateOf = (): RuntimeState =>
  (globalThis as TemporalCarrier).Temporal === undefined ? 'missing' : 'ready'
