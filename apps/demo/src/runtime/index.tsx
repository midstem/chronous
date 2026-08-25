import { isTemporalAvailable } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { NATIVE_LABEL, POLYFILL_LABEL, UNAVAILABLE_LABEL } from './constants'
import { hasNativeTemporal } from './helpers'

const label = (): string => {
  if (!isTemporalAvailable()) return UNAVAILABLE_LABEL

  return hasNativeTemporal() ? NATIVE_LABEL : POLYFILL_LABEL
}

export const Runtime = (): ReactElement => (
  <span className="badge">{label()}</span>
)

export { installTemporal } from './helpers'
