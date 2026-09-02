import { MissingTemporalError } from './errors'
import type { TemporalStatus } from './types'

type TemporalCarrier = { Temporal?: typeof Temporal }

const listeners = new Set<() => void>()

let installed: typeof Temporal | undefined

let loading: Promise<void> | undefined

let failure: MissingTemporalError | undefined

export const readTemporal = (): typeof Temporal | undefined =>
  installed ?? (globalThis as TemporalCarrier).Temporal

export const requireTemporal = (): typeof Temporal => {
  const temporal = readTemporal()

  if (!temporal) throw failure ?? new MissingTemporalError()

  return temporal
}

const load = async (): Promise<void> => {
  try {
    installed = (await import('temporal-polyfill')).Temporal
  } catch (cause) {
    failure = new MissingTemporalError(cause)
  }

  for (const listener of listeners) listener()
}

const started = (): Promise<void> => (loading ??= load())

export const temporalStatus = (): TemporalStatus => {
  if (readTemporal()) return 'ready'

  return failure ? 'failed' : 'pending'
}

export const subscribeTemporal = (listener: () => void): (() => void) => {
  if (temporalStatus() === 'pending') void started()

  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const ensureTemporal = async (): Promise<void> => {
  if (readTemporal()) return

  await started()

  if (!readTemporal()) throw failure ?? new MissingTemporalError()
}
