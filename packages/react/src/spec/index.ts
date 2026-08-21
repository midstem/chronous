import type { RangeSpec } from '@midstem/chronous'
import { useRef } from 'react'

import { sameSpec } from './helpers'

export const useStableSpec = (spec: RangeSpec): RangeSpec => {
  const held = useRef(spec)

  if (!sameSpec(held.current, spec)) held.current = spec

  return held.current
}
