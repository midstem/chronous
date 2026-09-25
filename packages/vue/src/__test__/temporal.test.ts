import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCalendar as useCalendarNative } from '../index'
import type { CalendarRange } from '../index'

type TemporalCarrier = { Temporal?: typeof Temporal }

const carrier = globalThis as TemporalCarrier

const held = carrier.Temporal

const RANGE: CalendarRange = {
  view: 'day',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}

const withoutTemporal = async <TResult>(
  run: (vue: typeof import('../index')) => Promise<TResult> | TResult
): Promise<TResult> => {
  vi.resetModules()
  delete carrier.Temporal

  try {
    return await run(await import('../index'))
  } finally {
    carrier.Temporal = held
  }
}

afterEach(() => {
  carrier.Temporal = held
  vi.resetModules()
})

describe('a browser with no Temporal', () => {
  it('reports an immediate missing Temporal error', async () => {
    await withoutTemporal(({ useCalendar, MissingTemporalError }) => {
      const result = useCalendar(RANGE, [])
      expect(result.calendar.value).toBeNull()
      expect(result.error.value).toBeInstanceOf(MissingTemporalError)
    })
  })
})

describe('a browser that ships Temporal', () => {
  it('draws the calendar on the first render', () => {
    const result = useCalendarNative(RANGE, [])

    expect(result.calendar.value?.days).toHaveLength(1)
  })
})
