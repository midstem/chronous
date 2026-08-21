import { afterEach, describe, expect, it, vi } from 'vitest'

import { PACKAGE_NAME, isTemporalAvailable } from '../index'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('@midstem/chronous', () => {
  it('is published under the midstem scope', () => {
    expect(PACKAGE_NAME).toBe('@midstem/chronous')
  })

  it('reports Temporal as available in a prepared runtime', () => {
    expect(isTemporalAvailable()).toBe(true)
  })

  it('reports Temporal as missing when the runtime has none', () => {
    vi.stubGlobal('Temporal', undefined)

    expect(isTemporalAvailable()).toBe(false)
  })
})
