import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput } from '#src/event'
import { buildRange } from '#src/range'
import { MINUTES_IN_DAY, toIso } from '#src/time'

import { buildLayout } from '../index'
import type { PlacedEvent } from '../types'

const MINUTES_IN_HOUR = 60
const SLOT_STEPS = [60, 30, 15]

const TRANSITIONS: [string, string][] = [
  ['Europe/Kyiv', '2026-10-25'],
  ['Europe/Kyiv', '2026-03-29'],
  ['Australia/Lord_Howe', '2026-04-05'],
  ['Australia/Lord_Howe', '2026-10-04'],
  ['America/Santiago', '2026-09-06'],
  ['Asia/Kolkata', '2026-03-29']
]

const placedOn = (
  timeZone: string,
  date: string,
  inputs: readonly EventInput[],
  disambiguation?: 'earlier' | 'later'
): PlacedEvent[] => {
  const range = buildRange({ view: 'day', currentDate: date, timeZone })

  return buildLayout(
    range,
    normalizeEvents(inputs, { timeZone, disambiguation })
  ).days[0].events
}

describe('boxes are placed by the wall clock', () => {
  it('lines an event up with its grid row across a gap', () => {
    const date = '2026-03-29'
    const day = buildRange({
      view: 'day',
      currentDate: date,
      timeZone: 'Europe/Kyiv'
    }).days[0]
    const [placed] = placedOn('Europe/Kyiv', date, [
      { id: 'a', start: `${date}T04:00`, end: `${date}T05:00` }
    ])

    expect(placed.startMinute).toBe(day.slots[4].minuteOfDay)
    expect(placed.top).toBe(day.slots[4].minuteOfDay / MINUTES_IN_DAY)
    expect(placed.minutes).toBe(MINUTES_IN_HOUR)
  })

  it('sizes a box by the wall clock and reports elapsed minutes', () => {
    const date = '2026-03-29'
    const [placed] = placedOn('Europe/Kyiv', date, [
      { id: 'a', start: `${date}T01:00`, end: `${date}T04:00` }
    ])

    expect(placed.endMinute - placed.startMinute).toBe(3 * MINUTES_IN_HOUR)
    expect(placed.minutes).toBe(2 * MINUTES_IN_HOUR)
  })

  it('starts the day at the first wall time the zone has', () => {
    const date = '2026-09-06'
    const range = buildRange({
      view: 'day',
      currentDate: date,
      timeZone: 'America/Santiago'
    })
    const [placed] = placedOn('America/Santiago', date, [
      { id: 'a', start: toIso(range.start), end: toIso(range.end) }
    ])

    expect(placed.startMinute).toBe(MINUTES_IN_HOUR)
    expect(placed.endMinute).toBe(MINUTES_IN_DAY)
    expect(placed.minutes).toBe(23 * MINUTES_IN_HOUR)
  })
})

describe('the repeated hour never runs backwards', () => {
  const date = '2026-10-25'
  const event = { id: 'a', start: `${date}T03:30`, duration: 'PT45M' }

  it('collapses a box that ends inside the hour it started in', () => {
    const [placed] = placedOn('Europe/Kyiv', date, [event], 'earlier')

    expect(placed.startMinute).toBe(3.5 * MINUTES_IN_HOUR)
    expect(placed.endMinute).toBe(placed.startMinute)
    expect(placed.height).toBe(0)
    expect(placed.minutes).toBe(45)
  })

  it('keeps its height on the second pass through the hour', () => {
    const [placed] = placedOn('Europe/Kyiv', date, [event], 'later')

    expect(placed.endMinute - placed.startMinute).toBe(45)
    expect(placed.minutes).toBe(45)
  })
})

describe.each(SLOT_STEPS)('a grid of %d minute events', (slotMinutes) => {
  it.each(TRANSITIONS)('holds its shape in %s on %s', (timeZone, date) => {
    const range = buildRange({
      view: 'day',
      currentDate: date,
      timeZone,
      slotMinutes
    })
    const inputs = range.days[0].slots.map((slot, index) => ({
      id: `slot-${index}`,
      start: toIso(slot.start),
      end: toIso(slot.end)
    }))
    const placed = buildLayout(range, normalizeEvents(inputs, { timeZone }))
      .days[0].events

    expect(placed).toHaveLength(inputs.length)
    placed.forEach((item, index) => {
      expect(item.height).toBeGreaterThanOrEqual(0)
      expect(item.top).toBeGreaterThanOrEqual(0)
      expect(item.top + item.height).toBeLessThanOrEqual(1)

      if (index > 0)
        expect(item.startMinute).toBeGreaterThanOrEqual(
          placed[index - 1].startMinute
        )
    })
  })
})
