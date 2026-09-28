import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InvalidRangeError } from '#src/range'
import type { CalendarRange } from '#src/range'

import { resetFallbackWarning } from '../date-fallback'
import { buildCalendar } from '../index'

const RANGE: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}

beforeEach(() => {
  resetFallbackWarning()
  vi.stubGlobal('Temporal', undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('automatic Date fallback', () => {
  it('renders fixed, floating, duration and all-day events with the ordinary range API', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(RANGE, [
      {
        id: 'fixed',
        start: '2026-03-18T07:00:00Z',
        end: '2026-03-18T08:00:00Z'
      },
      {
        id: 'floating',
        start: '2026-03-18T11:00:00',
        duration: 'PT30M'
      },
      { id: 'holiday', start: '2026-03-18', end: '2026-03-20' }
    ])

    expect(calendar.days[2].boxes.map((box) => box.event.id)).toEqual([
      'fixed',
      'floating'
    ])
    expect(calendar.days[2].boxes[0].start).toBe('2026-03-18T09:00:00+02:00')
    expect(calendar.days[2].boxes[1].end).toBe('2026-03-18T11:30:00+02:00')
    expect(calendar.rows[0].bars[0].event.id).toBe('holiday')
    expect(warning.mock.calls[0][0]).toContain('temporal-polyfill/global')
    expect(
      warning.mock.calls.filter(([text]) =>
        String(text).includes('Temporal is missing')
      )
    ).toHaveLength(1)
  })

  it('shows approximate recurring instances alongside ordinary events', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(RANGE, [
      {
        id: 'series',
        start: '2026-03-18T09:00:00',
        recurrence: { rule: 'FREQ=DAILY;COUNT=3' }
      },
      {
        id: 'ordinary',
        start: '2026-03-18T07:00:00Z',
        end: '2026-03-18T08:00:00Z'
      }
    ])

    expect(calendar.days[2].boxes.map((box) => box.event.id)).toEqual([
      'ordinary',
      'series__2026-03-18T09:00:00+02:00'
    ])
    expect(calendar.days[3].boxes[0].event.seriesId).toBe('series')
    expect(calendar.days[4].boxes[0].event.seriesId).toBe('series')
    expect(
      warning.mock.calls.some(
        ([text]) =>
          String(text).includes('series') &&
          String(text).includes('approximate')
      )
    ).toBe(true)
  })

  it('shows a long-running series in the current view and applies an exception', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(RANGE, [
      {
        id: 'daily',
        start: '2025-01-01T09:00:00',
        duration: 'PT30M',
        recurrence: {
          rule: 'FREQ=DAILY',
          exceptions: ['2026-03-18T09:00:00']
        }
      }
    ])

    expect(calendar.days[1].boxes[0].event.seriesId).toBe('daily')
    expect(calendar.days[2].boxes).toHaveLength(0)
    expect(calendar.days[3].boxes[0].event.seriesId).toBe('daily')
  })

  it('keeps a malformed series visible at its original date', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(RANGE, [
      {
        id: 'broken-rule',
        start: '2026-03-18T09:00:00',
        recurrence: { rule: 'FREQ=HOURLY' }
      }
    ])

    expect(calendar.days[2].boxes[0].event.seriesId).toBe('broken-rule')
    expect(
      warning.mock.calls.some(([text]) =>
        String(text).includes('could not be read')
      )
    ).toBe(true)
  })

  it('keeps a series visible when UNTIL cannot be read', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(RANGE, [
      {
        id: 'bad-until',
        start: '2026-03-18T09:00:00',
        recurrence: { rule: 'FREQ=DAILY;UNTIL=not-a-date' }
      }
    ])

    expect(calendar.days[2].boxes[0].event.seriesId).toBe('bad-until')
    expect(
      warning.mock.calls.some(([text]) => String(text).includes('UNTIL'))
    ).toBe(true)
  })

  it('applies a moved override in the visible range', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(RANGE, [
      {
        id: 'moved',
        start: '2026-03-18T09:00:00',
        duration: 'PT1H',
        recurrence: {
          rule: 'FREQ=DAILY;COUNT=2',
          overrides: [
            {
              recurrenceId: '2026-03-18T09:00:00',
              start: '2026-03-19T14:00:00'
            }
          ]
        }
      }
    ])

    expect(calendar.days[2].boxes).toHaveLength(0)
    expect(calendar.days[3].boxes.map((box) => box.event.seriesId)).toEqual([
      'moved',
      'moved'
    ])
  })

  it('renders a DST transition day with nonnegative slots and a specific warning', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const calendar = buildCalendar(
      { ...RANGE, view: 'day', currentDate: '2026-03-29' },
      []
    )
    const day = calendar.days[0]

    expect(day.date).toBe('2026-03-29')
    expect(day.slots).toHaveLength(24)
    expect(day.slots.every((slot) => slot.minutes >= 0)).toBe(true)
    expect(day.slots.reduce((sum, slot) => sum + slot.minutes, 0)).toBe(
      day.minutes
    )
    expect(
      warning.mock.calls.some(([text]) => String(text).includes('transition'))
    ).toBe(true)
  })

  it('keeps the extra hour of a fall transition in the final slot', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const day = buildCalendar(
      {
        view: 'day',
        currentDate: '2026-11-01',
        timeZone: 'America/New_York'
      },
      []
    ).days[0]

    expect(day.minutes).toBe(1500)
    expect(day.slots).toHaveLength(24)
    expect(day.slots.reduce((sum, slot) => sum + slot.minutes, 0)).toBe(1500)
  })

  it('still rejects an invalid calendar time zone', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      buildCalendar({ ...RANGE, timeZone: 'Invalid/Zone' }, [])
    ).toThrow(InvalidRangeError)
  })
})
