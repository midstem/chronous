import { describe, expect, it } from 'vitest'

import { hoursInDay, toIso, zoned } from '#src/time'
import type { Disambiguation } from '#src/time'

import { buildRange } from '../index'
import type { RangeDay } from '../types'

const MINUTES_IN_HOUR = 60
const SLOTS_PER_DAY = 24
const SLOT_STEPS = [60, 30, 15]

const DISAMBIGUATIONS: Disambiguation[] = [
  'compatible',
  'earlier',
  'later',
  'reject'
]

const dayOf = (timeZone: string, date: string, slotMinutes = 60): RangeDay =>
  buildRange({ view: 'day', currentDate: date, timeZone, slotMinutes }).days[0]

const TRANSITIONS: [string, string, number][] = [
  ['Europe/Kyiv', '2026-10-25', 25],
  ['Europe/Kyiv', '2026-03-29', 23],
  ['Australia/Lord_Howe', '2026-04-05', 24.5],
  ['Australia/Lord_Howe', '2026-10-04', 23.5],
  ['America/Santiago', '2026-09-06', 23],
  ['Asia/Kolkata', '2026-03-29', 24]
]

describe('the grid keeps its wall-clock shape', () => {
  it.each(TRANSITIONS)('%s on %s still has 24 rows', (timeZone, date) => {
    const day = dayOf(timeZone, date)

    expect(day.slots).toHaveLength(SLOTS_PER_DAY)
    expect(day.slots.map((slot) => slot.minuteOfDay)).toEqual(
      Array.from(
        { length: SLOTS_PER_DAY },
        (_, index) => index * MINUTES_IN_HOUR
      )
    )
  })

  it.each(TRANSITIONS)(
    '%s on %s spreads %d hours over those rows',
    (timeZone, date, hours) => {
      const day = dayOf(timeZone, date)
      const total = day.slots.reduce((sum, slot) => sum + slot.minutes, 0)

      expect(total).toBe(hours * MINUTES_IN_HOUR)
      expect(total).toBe(hoursInDay(zoned(date, timeZone)) * MINUTES_IN_HOUR)
    }
  )
})

describe('rows absorb the transition', () => {
  it('swells the repeated hour on fall back', () => {
    const day = dayOf('Europe/Kyiv', '2026-10-25')

    expect(day.slots[3].minutes).toBe(2 * MINUTES_IN_HOUR)
    expect(toIso(day.slots[3].start)).toBe('2026-10-25T03:00:00+03:00')
    expect(toIso(day.slots[4].start)).toBe('2026-10-25T04:00:00+02:00')
  })

  it('collapses the skipped hour on spring forward', () => {
    const day = dayOf('Europe/Kyiv', '2026-03-29')

    expect(day.slots[3].minutes).toBe(0)
    expect(toIso(day.slots[3].start)).toBe('2026-03-29T04:00:00+03:00')
    expect(toIso(day.slots[3].end)).toBe(toIso(day.slots[3].start))
  })

  it('handles a half-hour shift backwards', () => {
    const day = dayOf('Australia/Lord_Howe', '2026-04-05')

    expect(day.slots[1].minutes).toBe(90)
    expect(day.slots[2].minutes).toBe(MINUTES_IN_HOUR)
  })

  it('handles a half-hour shift forwards', () => {
    const day = dayOf('Australia/Lord_Howe', '2026-10-04')

    expect(day.slots[2].minutes).toBe(30)
    expect(toIso(day.slots[2].start)).toBe('2026-10-04T02:30:00+11:00')
  })

  it('collapses a midnight transition into the first row', () => {
    const day = dayOf('America/Santiago', '2026-09-06')

    expect(day.slots[0].minutes).toBe(0)
    expect(toIso(day.slots[0].start)).toBe(toIso(day.start))
    expect(toIso(day.start)).toBe('2026-09-06T01:00:00-03:00')
  })
})

describe('rows never run backwards', () => {
  it.each(
    SLOT_STEPS.flatMap((slotMinutes) =>
      TRANSITIONS.map(
        ([timeZone, date]) => [timeZone, date, slotMinutes] as const
      )
    )
  )('%s on %s at a %d minute step', (timeZone, date, slotMinutes) => {
    const day = dayOf(timeZone, date, slotMinutes)
    const total = day.slots.reduce((sum, slot) => sum + slot.minutes, 0)

    expect(day.slots.every((slot) => slot.minutes >= 0)).toBe(true)
    expect(toIso(day.slots[0].start)).toBe(toIso(day.start))
    expect(toIso(day.slots[day.slots.length - 1].end)).toBe(toIso(day.end))
    expect(total).toBe(day.minutes)
  })
})

describe('spans crossing a transition', () => {
  it('keeps every day 24 rows across the week', () => {
    const range = buildRange({
      view: 'week',
      currentDate: '2026-03-29',
      timeZone: 'Europe/Kyiv'
    })

    expect(range.days.every((day) => day.slots.length === SLOTS_PER_DAY)).toBe(
      true
    )
    expect(range.days.map((day) => day.minutes / MINUTES_IN_HOUR)).toEqual([
      24, 24, 24, 24, 24, 24, 23
    ])
  })
})

describe('the grid ignores the disambiguation events are read with', () => {
  const startsUnder = (disambiguation: Disambiguation): string[] =>
    buildRange({
      view: 'day',
      currentDate: '2026-03-29',
      timeZone: 'Europe/Kyiv',
      disambiguation
    }).days[0].slots.map((slot) => toIso(slot.start))

  it('never refuses a row the zone skipped', () => {
    expect(() => startsUnder('reject')).not.toThrow()
  })

  it.each(DISAMBIGUATIONS)('draws the same rows under %s', (disambiguation) => {
    expect(startsUnder(disambiguation)).toEqual(startsUnder('compatible'))
  })
})
