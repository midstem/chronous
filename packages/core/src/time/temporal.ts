import { MissingTemporalError } from './errors'
type TemporalCarrier = { Temporal?: typeof Temporal }

export const readTemporal = (): typeof Temporal | undefined =>
  (globalThis as TemporalCarrier).Temporal

export const requireTemporal = (): typeof Temporal => {
  const temporal = readTemporal()

  if (!temporal) throw new MissingTemporalError()

  return temporal
}
