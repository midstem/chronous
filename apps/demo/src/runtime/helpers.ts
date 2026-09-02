import { ensureTemporal, isTemporalAvailable } from '@midstem/chronous-react'

import type { RuntimeState } from './types'

type TemporalCarrier = { Temporal?: unknown }

let nativeTemporal = false

export const hasNativeTemporal = (): boolean => nativeTemporal

export const runtimeState = (): RuntimeState => {
  if (!isTemporalAvailable()) return 'missing'

  return nativeTemporal ? 'native' : 'polyfill'
}

export const installTemporal = async (): Promise<void> => {
  nativeTemporal = (globalThis as TemporalCarrier).Temporal !== undefined

  await ensureTemporal()
}
