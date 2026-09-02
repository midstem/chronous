import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCalendar as useCalendarNative } from '../index'
import type { CalendarRange } from '../index'

type TemporalCarrier = { Temporal?: typeof Temporal }

const carrier = globalThis as TemporalCarrier

const held = carrier.Temporal

const RANGE: CalendarRange = {
  view: 'day',
  date: '2026-03-18',
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
  it('loads the polyfill from the first render, with no setup call', async () => {
    await withoutTemporal(async ({ useCalendar, MissingTemporalError }) => {
      const { result } = renderHook(() => useCalendar(RANGE, []))

      expect(result.current.pending).toBe(true)
      expect(result.current.calendar).toBeNull()
      expect(result.current.error).toBeInstanceOf(MissingTemporalError)

      await waitFor(() => expect(result.current.pending).toBe(false))

      expect(result.current.error).toBeNull()
      expect(result.current.calendar?.days).toHaveLength(1)
    })
  })

  it('draws renderPending on Calendar.Root until the chunk lands', async () => {
    await withoutTemporal(async ({ Calendar }) => {
      render(
        <Calendar.Root
          range={RANGE}
          events={[]}
          renderPending={() => <p>loading</p>}
        >
          {() => <p>drawn</p>}
        </Calendar.Root>
      )

      expect(screen.getByText('loading')).toBeDefined()

      await waitFor(() => expect(screen.getByText('drawn')).toBeDefined())
    })
  })

  it('revives navigation once the engine is in place', async () => {
    await withoutTemporal(async ({ useCalendarNavigation }) => {
      const { result } = renderHook(() => useCalendarNavigation(RANGE))

      expect(result.current.next).toBeNull()

      await waitFor(() => expect(result.current.next).not.toBeNull())

      expect(result.current.prev?.date).toBe('2026-03-17')
      expect(result.current.today).not.toBeNull()
    })
  })
})

describe('a browser that ships Temporal', () => {
  it('draws the calendar on the first render, with no pending frame', () => {
    let renders = 0

    const { result } = renderHook(() => {
      renders += 1

      return useCalendarNative(RANGE, [])
    })

    expect(renders).toBe(1)
    expect(result.current.pending).toBe(false)
    expect(result.current.calendar?.days).toHaveLength(1)
  })
})
