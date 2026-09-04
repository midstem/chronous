import type { CalendarRange } from '@midstem/chronous'

const keysOf = (range: CalendarRange): (keyof CalendarRange)[] =>
  Object.keys(range) as (keyof CalendarRange)[]

export const sameRange = (
  left: CalendarRange,
  right: CalendarRange
): boolean => {
  const keys = keysOf(left)

  if (keys.length !== keysOf(right).length) return false

  return keys.every((key) => left[key] === right[key])
}
