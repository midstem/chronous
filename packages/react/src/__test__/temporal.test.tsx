import { renderHook } from '@testing-library/react'
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

const withoutTemporal = async <TResult,>(
  run: (react: typeof import('../index')) => Promise<TResult> | TResult
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
  it('draws automatically with the Date fallback', async () => {
    await withoutTemporal(({ useCalendar }) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { result } = renderHook(() => useCalendar(RANGE, []))
      expect(result.current.calendar?.days).toHaveLength(1)
      expect(result.current.error).toBeNull()
      expect(warning).toHaveBeenCalled()
      warning.mockRestore()
    })
  })

  it('renders a fixed event without extra range options', async () => {
    await withoutTemporal(({ useCalendar }) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        const { result } = renderHook(() =>
          useCalendar(RANGE, [
            {
              id: 'meeting',
              start: '2026-03-18T07:00:00Z',
              end: '2026-03-18T08:00:00Z'
            }
          ])
        )
        expect(result.current.error).toBeNull()
        expect(result.current.calendar?.days[0].boxes[0].start).toBe(
          '2026-03-18T09:00:00+02:00'
        )
      } finally {
        warning.mockRestore()
      }
    })
  })
})

describe('a browser that ships Temporal', () => {
  it('draws the calendar on the first render', () => {
    let renders = 0

    const { result } = renderHook(() => {
      renders += 1

      return useCalendarNative(RANGE, [])
    })

    expect(renders).toBe(1)
    expect(result.current.calendar?.days).toHaveLength(1)
  })
})
