import type { TemporalStatus } from '@midstem/chronous-react'

import type { RuntimeState } from './types'

type TemporalCarrier = { Temporal?: unknown }

const nativeTemporal = (globalThis as TemporalCarrier).Temporal !== undefined

export const runtimeStateOf = (status: TemporalStatus): RuntimeState => {
  if (status !== 'ready') return 'missing'

  return nativeTemporal ? 'native' : 'polyfill'
}
