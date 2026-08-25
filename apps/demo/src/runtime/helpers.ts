type TemporalCarrier = { Temporal?: unknown }

let nativeTemporal = false

export const hasNativeTemporal = (): boolean => nativeTemporal

export const installTemporal = async (): Promise<void> => {
  nativeTemporal = (globalThis as TemporalCarrier).Temporal !== undefined

  if (nativeTemporal) return

  await import('temporal-polyfill/global')
}
