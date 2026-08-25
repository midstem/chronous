import { describe, expect, it } from 'vitest'

import { InvalidEventError } from '#src/event'
import type { EventInput } from '#src/event'
import type { RangeSpec } from '#src/range'

import { buildCalendar } from '../index'
import type { CalendarDay } from '../types'

const MINUTES_IN_HOUR = 60
const SLOTS_PER_DAY = 24
const KYIV = 'Europe/Kyiv'

const TRANSITIONS: [string, string, number][] = [
  ['Europe/Kyiv', '2026-10-25', 25],
  ['Europe/Kyiv', '2026-03-29', 23],
  ['Australia/Lord_Howe', '2026-04-05', 24.5],
  ['Australia/Lord_Howe', '2026-10-04', 23.5],
  ['America/Santiago', '2026-09-06', 23],
  ['Asia/Kolkata', '2026-03-29', 24]
]

const dayOf = (
  timeZone: string,
  date: string,
  inputs: readonly EventInput[] = []
): CalendarDay => buildCalendar({ view: 'day', date, timeZone }, inputs).days[0]

describe('serialised rows keep the transition', () => {
  it.each(TRANSITIONS)(
    '%s on %s spreads %d hours over 24 rows',
    (timeZone, date, hours) => {
      const day = dayOf(timeZone, date)
      const total = day.slots.reduce((sum, slot) => sum + slot.minutes, 0)

      expect(day.slots).toHaveLength(SLOTS_PER_DAY)
      expect(total).toBe(hours * MINUTES_IN_HOUR)
      expect(total).toBe(day.minutes)
      expect(day.slots[0].start).toBe(day.start)
      expect(day.slots[SLOTS_PER_DAY - 1].end).toBe(day.end)
    }
  )

  it.each(TRANSITIONS)(
    '%s on %s survives a JSON round trip',
    (timeZone, date) => {
      const day = dayOf(timeZone, date, [
        { id: 'a', start: `${date}T01:00`, duration: 'PT3H' },
        { id: 'b', start: date }
      ])

      expect(JSON.parse(JSON.stringify(day))).toEqual(day)
    }
  )

  it('carries both offsets across a repeated hour', () => {
    const day = dayOf(KYIV, '2026-10-25')

    expect(day.slots[3]).toEqual({
      minuteOfDay: 180,
      start: '2026-10-25T03:00:00+03:00',
      end: '2026-10-25T04:00:00+02:00',
      minutes: 2 * MINUTES_IN_HOUR
    })
    expect(day.slots[4].start).toBe(day.slots[3].end)
  })

  it('collapses the skipped hour to a zero-length row', () => {
    const day = dayOf(KYIV, '2026-03-29')

    expect(day.slots[3].minutes).toBe(0)
    expect(day.slots[3].start).toBe('2026-03-29T04:00:00+03:00')
    expect(day.slots[3].end).toBe(day.slots[3].start)
  })

  it('starts the day at one in the morning when midnight does not exist', () => {
    const day = dayOf('America/Santiago', '2026-09-06')

    expect(day.start).toBe('2026-09-06T01:00:00-03:00')
    expect(day.slots[0].minutes).toBe(0)
  })

  it('keeps a half-hour shift on the row it lands in', () => {
    const day = dayOf('Australia/Lord_Howe', '2026-10-04')

    expect(day.slots[2].start).toBe('2026-10-04T02:30:00+11:00')
    expect(day.slots[2].minutes).toBe(30)
  })
})

describe('boxes are drawn by the wall clock', () => {
  it('sizes a box by the clock and reports elapsed minutes', () => {
    const [box] = dayOf(KYIV, '2026-03-29', [
      { id: 'a', start: '2026-03-29T01:00', end: '2026-03-29T04:00' }
    ]).boxes

    expect(box).toMatchObject({
      startMinute: MINUTES_IN_HOUR,
      endMinute: 4 * MINUTES_IN_HOUR,
      minutes: 2 * MINUTES_IN_HOUR,
      height: 0.125
    })
    expect(box.start).toBe('2026-03-29T01:00:00+02:00')
    expect(box.end).toBe('2026-03-29T04:00:00+03:00')
  })

  it('never runs a box backwards inside a repeated hour', () => {
    const [box] = dayOf(KYIV, '2026-10-25', [
      {
        id: 'a',
        start: '2026-10-25T03:30+03:00',
        end: '2026-10-25T03:30+02:00'
      }
    ]).boxes

    expect(box.height).toBe(0)
    expect(box.minutes).toBe(MINUTES_IN_HOUR)
  })
})

describe('the spec reaches event normalization', () => {
  const spec: RangeSpec = { view: 'day', date: '2026-03-29', timeZone: KYIV }

  it('resolves a skipped wall time forwards by default', () => {
    const [box] = buildCalendar(spec, [
      { id: 'a', start: '2026-03-29T03:30', duration: 'PT30M' }
    ]).days[0].boxes

    expect(box.event.start).toBe('2026-03-29T04:30:00+03:00')
  })

  it('honours the disambiguation the spec asks for', () => {
    const [box] = buildCalendar({ ...spec, disambiguation: 'earlier' }, [
      { id: 'a', start: '2026-03-29T03:30', duration: 'PT30M' }
    ]).days[0].boxes

    expect(box.event.start).toBe('2026-03-29T02:30:00+02:00')
  })

  it('refuses a skipped wall time without touching the grid', () => {
    const refusing: RangeSpec = { ...spec, disambiguation: 'reject' }

    expect(buildCalendar(refusing, []).days[0].slots).toHaveLength(
      SLOTS_PER_DAY
    )
    expect(() =>
      buildCalendar(refusing, [
        { id: 'a', start: '2026-03-29T03:30', duration: 'PT30M' }
      ])
    ).toThrow(InvalidEventError)
  })

  it('lifts a wall-clock day that is only twenty-three real hours', () => {
    const calendar = buildCalendar(
      { view: 'week', date: '2026-03-25', timeZone: KYIV },
      [{ id: 'a', start: '2026-03-28T09:00', end: '2026-03-29T09:00' }]
    )

    expect(calendar.rows[0].bars[0]).toMatchObject({ days: 2 })
    expect(calendar.days.every((day) => day.boxes.length === 0)).toBe(true)
  })
})
