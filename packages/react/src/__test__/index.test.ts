import { describe, expect, it } from 'vitest'

import { CORE_PACKAGE, PACKAGE_NAME } from '../index'

describe('@midstem/chronous-react', () => {
  it('is published under the midstem scope', () => {
    expect(PACKAGE_NAME).toBe('@midstem/chronous-react')
  })

  it('resolves the core package through the workspace', () => {
    expect(CORE_PACKAGE).toBe('@midstem/chronous')
  })

  it('runs against a DOM environment', () => {
    expect(typeof document).toBe('object')
  })
})
