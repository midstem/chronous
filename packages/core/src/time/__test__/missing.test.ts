import { afterEach, describe, expect, it, vi } from 'vitest'

type TemporalCarrier = { Temporal?: typeof Temporal }

const carrier = globalThis as TemporalCarrier

const held = carrier.Temporal

const withoutTemporal = async <TResult>(
  run: (engine: typeof import('../../index')) => Promise<TResult> | TResult
): Promise<TResult> => {
  vi.resetModules()
  delete carrier.Temporal

  try {
    return await run(await import('../../index'))
  } finally {
    carrier.Temporal = held
  }
}

const RANGE = {
  view: 'week',
  date: '2026-03-25',
  timeZone: 'Europe/Kyiv'
} as const

afterEach(() => {
  carrier.Temporal = held
  vi.resetModules()
})

describe('a runtime with no Temporal', () => {
  it('fails buildCalendar with MissingTemporalError, not a bad time zone', async () => {
    await withoutTemporal(({ buildCalendar, MissingTemporalError }) => {
      expect(() => buildCalendar(RANGE, [])).toThrow(MissingTemporalError)
    })
  })

  it('names the polyfill and the setup call in the message', async () => {
    await withoutTemporal(({ buildCalendar }) => {
      expect(() => buildCalendar(RANGE, [])).toThrow(/ensureTemporal/)
    })
  })

  it('fails a navigation step the same way', async () => {
    await withoutTemporal(
      ({ calendarReducer, initialCalendarState, MissingTemporalError }) => {
        expect(() =>
          calendarReducer(initialCalendarState(RANGE), { type: 'next' })
        ).toThrow(MissingTemporalError)
      }
    )
  })

  it('fails formatIso the same way', async () => {
    await withoutTemporal(({ formatIso, MissingTemporalError }) => {
      expect(() => formatIso('2026-03-25', { locale: 'en-GB' })).toThrow(
        MissingTemporalError
      )
    })
  })

  it('reports Temporal as unavailable', async () => {
    await withoutTemporal(({ isTemporalAvailable }) => {
      expect(isTemporalAvailable()).toBe(false)
    })
  })

  it('is repaired by ensureTemporal, which leaves globalThis alone', async () => {
    await withoutTemporal(async (engine) => {
      await engine.ensureTemporal()

      expect(engine.isTemporalAvailable()).toBe(true)
      expect(carrier.Temporal).toBeUndefined()
      expect(engine.buildCalendar(RANGE, []).days).toHaveLength(7)
    })
  })
})

describe('ensureTemporal on a runtime that already has Temporal', () => {
  it('keeps the engine already in place', async () => {
    vi.resetModules()

    const engine = await import('../../index')

    await engine.ensureTemporal()

    expect(engine.isTemporalAvailable()).toBe(true)
    expect(engine.buildCalendar(RANGE, []).days).toHaveLength(7)
  })
})
