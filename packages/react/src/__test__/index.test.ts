import * as core from '@midstem/chronous'
import { describe, expect, it } from 'vitest'

import * as react from '../index'
import { CORE_PACKAGE, PACKAGE_NAME } from '../index'

const OWN_NAMES = ['PACKAGE_NAME']

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

  it('re-exports the engine so one install is enough', () => {
    const missing = Object.keys(core).filter(
      (name) => !OWN_NAMES.includes(name) && !(name in react)
    )

    expect(missing).toEqual([])
  })

  it('hands back the same engine functions, not copies', () => {
    expect(react.buildCalendar).toBe(core.buildCalendar)
    expect(react.InvalidRangeError).toBe(core.InvalidRangeError)
  })
})
