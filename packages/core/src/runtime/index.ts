import { readTemporal } from '../time/temporal'

export const isTemporalAvailable = (): boolean => readTemporal() !== undefined
