import * as core from '@midstem/chronous'
import { describe, expect, it } from 'vitest'

import * as vue from '../index'

describe('@midstem/chronous-vue', () => {
  it('runs against a DOM environment', () => {
    expect(typeof document).toBe('object')
  })

  it('re-exports the engine so one install is enough', () => {
    const missing = Object.keys(core).filter((name) => !(name in vue))

    expect(missing).toEqual([])
  })

  it('hands back the same engine functions, not copies', () => {
    expect(vue.buildCalendar).toBe(core.buildCalendar)
    expect(vue.InvalidRangeError).toBe(core.InvalidRangeError)
  })
})
