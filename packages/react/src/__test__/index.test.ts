import * as core from '@midstem/chronous'
import { describe, expect, it } from 'vitest'

import * as react from '../index'

describe('@midstem/chronous-react', () => {
  it('runs against a DOM environment', () => {
    expect(typeof document).toBe('object')
  })

  it('re-exports the engine so one install is enough', () => {
    const missing = Object.keys(core).filter((name) => !(name in react))

    expect(missing).toEqual([])
  })

  it('hands back the same engine functions, not copies', () => {
    expect(react.buildCalendar).toBe(core.buildCalendar)
    expect(react.InvalidRangeError).toBe(core.InvalidRangeError)
  })
})
