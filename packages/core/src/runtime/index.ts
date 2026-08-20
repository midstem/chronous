type TemporalCarrier = { Temporal?: unknown }

export const hasNativeTemporal = (): boolean =>
  typeof (globalThis as TemporalCarrier).Temporal !== 'undefined'
