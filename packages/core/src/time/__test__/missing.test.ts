import { afterEach, describe, expect, it, vi } from 'vitest'

type TemporalCarrier = { Temporal?: typeof Temporal }

const carrier = globalThis as TemporalCarrier
const held = carrier.Temporal

const withoutTemporal = async <TResult>(
  run: (engine: typeof import('../../index')) => Promise<TResult> | TResult
): Promise<TResult> => {
  vi.resetModules()
  delete carrier.Temporal
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    return await run(await import('../../index'))
  } finally {
    warning.mockRestore()
    carrier.Temporal = held
  }
}

const RANGE = {
  view: 'week',
  currentDate: '2026-03-25',
  timeZone: 'Europe/Kyiv'
} as const

afterEach(() => {
  carrier.Temporal = held
  vi.resetModules()
})

describe('a runtime with no Temporal', () => {
  it('builds a calendar automatically and leaves the global untouched', async () => {
    await withoutTemporal(({ buildCalendar, isTemporalAvailable }) => {
      expect(isTemporalAvailable()).toBe(false)
      expect(buildCalendar(RANGE, []).days).toHaveLength(7)
      expect(carrier.Temporal).toBeUndefined()
    })
  })

  it('keeps navigation working', async () => {
    await withoutTemporal(({ calendarReducer, initialCalendarState }) => {
      const state = initialCalendarState(RANGE)
      expect(calendarReducer(state, { type: 'next' }).range.currentDate).toBe(
        '2026-04-01'
      )
      expect(
        calendarReducer(state, {
          type: 'today',
          now: '2026-08-25T23:30:00Z'
        }).range.currentDate
      ).toBe('2026-08-26')
    })
  })

  it('formats date-only, absolute and floating values', async () => {
    await withoutTemporal(({ formatIso }) => {
      expect(
        formatIso('2026-03-25', {
          locale: 'en-GB',
          options: { year: 'numeric', month: '2-digit', day: '2-digit' }
        })
      ).toBe('25/03/2026')
      expect(
        formatIso('2026-03-25T09:00:00+02:00', {
          locale: 'en-GB',
          options: { hour: '2-digit', minute: '2-digit', hour12: false }
        })
      ).toBe('09:00')
      expect(
        formatIso('2026-03-25T09:00:00', {
          locale: 'en-GB',
          options: { hour: '2-digit', minute: '2-digit', hour12: false }
        })
      ).toBe('09:00')
    })
  })

  it('uses Temporal automatically if the host installs it later', async () => {
    await withoutTemporal(({ buildCalendar }) => {
      const events = [
        {
          id: 'series',
          start: '2026-03-25T09:00:00',
          recurrence: { rule: 'FREQ=DAILY;COUNT=2' }
        }
      ]
      expect(
        buildCalendar(RANGE, events).days.flatMap((day) => day.boxes)
      ).toHaveLength(0)
      carrier.Temporal = held
      expect(
        buildCalendar(RANGE, events).days.flatMap((day) => day.boxes)
      ).toHaveLength(2)
    })
  })
})
