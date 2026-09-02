import { MissingTemporalError } from './errors'

type TemporalCarrier = { Temporal?: typeof Temporal }

let installed: typeof Temporal | undefined

export const readTemporal = (): typeof Temporal | undefined =>
  installed ?? (globalThis as TemporalCarrier).Temporal

export const requireTemporal = (): typeof Temporal => {
  const temporal = readTemporal()

  if (!temporal) throw new MissingTemporalError()

  return temporal
}

export const ensureTemporal = async (): Promise<void> => {
  if (readTemporal()) return

  installed = (await import('temporal-polyfill')).Temporal
}
