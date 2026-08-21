import type { RangeSpec } from '@midstem/chronous'

const keysOf = (spec: RangeSpec): (keyof RangeSpec)[] =>
  Object.keys(spec) as (keyof RangeSpec)[]

export const sameSpec = (left: RangeSpec, right: RangeSpec): boolean => {
  const keys = keysOf(left)

  if (keys.length !== keysOf(right).length) return false

  return keys.every((key) => left[key] === right[key])
}
