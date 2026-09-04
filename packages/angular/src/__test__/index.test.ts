import * as core from '@midstem/chronous'
import { describe, expect, it } from 'vitest'

import * as angular from '../index'

describe('@midstem/chronous-angular', () => {
  it('runs against a DOM environment', () => {
    expect(typeof document).toBe('object')
  })

  it('re-exports the engine so one install is enough', () => {
    const missing = Object.keys(core).filter((name) => !(name in angular))

    expect(missing).toEqual([])
  })

  it('hands back the same engine functions, not copies', () => {
    expect(angular.buildCalendar).toBe(core.buildCalendar)
    expect(angular.InvalidRangeError).toBe(core.InvalidRangeError)
  })

  it('ships every directive under one import', () => {
    expect(angular.CALENDAR_DIRECTIVES).toHaveLength(23)
  })
})
