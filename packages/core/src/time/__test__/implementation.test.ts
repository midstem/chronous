import { describe, expect, it } from 'vitest'

import { isTemporalAvailable } from '../../runtime'

const POLYFILL_MODE = 'polyfill'
const NATIVE_MODE = 'native'
const NATIVE_CODE_MARKER = '[native code]'

const expectedMode = process.env.CHRONOUS_TEMPORAL ?? POLYFILL_MODE

const installedMode = (): string =>
  Function.prototype.toString
    .call(globalThis.Temporal.ZonedDateTime)
    .includes(NATIVE_CODE_MARKER)
    ? NATIVE_MODE
    : POLYFILL_MODE

describe('Temporal implementation under test', () => {
  it('is present', () => {
    expect(isTemporalAvailable()).toBe(true)
  })

  it('matches the mode the suite was started in', () => {
    expect(installedMode()).toBe(expectedMode)
  })
})
