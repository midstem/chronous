import { subscribeTemporal, temporalStatus } from '@midstem/chronous'
import type { TemporalStatus } from '@midstem/chronous'
import { useSyncExternalStore } from 'react'

export const useTemporalStatus = (): TemporalStatus =>
  useSyncExternalStore(subscribeTemporal, temporalStatus, temporalStatus)
