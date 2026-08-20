import { afterEach, describe, expect, it, vi } from 'vitest'

import { PACKAGE_NAME, hasNativeTemporal } from '../index'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('@midstem/chronous', () => {
  it('is published under the midstem scope', () => {
    expect(PACKAGE_NAME).toBe('@midstem/chronous')
  })

  it('detects a runtime that ships Temporal', () => {
    vi.stubGlobal('Temporal', {})

    expect(hasNativeTemporal()).toBe(true)
  })

  it('detects a runtime without Temporal', () => {
    vi.stubGlobal('Temporal', undefined)

    expect(hasNativeTemporal()).toBe(false)
  })
})
