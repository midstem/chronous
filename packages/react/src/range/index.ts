import type { CalendarRange } from '@midstem/chronous'
import { useRef } from 'react'

import { sameRange } from './helpers'

export const useStableRange = (range: CalendarRange): CalendarRange => {
  const held = useRef(range)

  if (!sameRange(held.current, range)) held.current = range

  return held.current
}
