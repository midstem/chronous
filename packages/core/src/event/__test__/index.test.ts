import { describe, expect, it } from 'vitest'

import { toIso } from '#src/time'

import {
  InvalidEventError,
  isAllDayEvent,
  isTimedEvent,
  normalizeEvent,
  normalizeEvents
} from '../index'
import type { NormalizeContext } from '../types'

const KYIV: NormalizeContext = { timeZone: 'Europe/Kyiv' }
const BERLIN: NormalizeContext = { timeZone: 'Europe/Berlin' }
const LOS_ANGELES: NormalizeContext = { timeZone: 'America/Los_Angeles' }

describe('timed events', () => {
  it('keeps a point event zero length', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T09:00:00' },
      KYIV
    )

    expect(event.allDay).toBe(false)
    expect(toIso(event.start)).toBe('2026-05-10T09:00:00+03:00')
    expect(toIso(event.end)).toBe('2026-05-10T09:00:00+03:00')
  })

  it('reads an explicit end', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T09:00:00', end: '2026-05-10T10:30:00' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-05-10T10:30:00+03:00')
  })

  it('derives an end from a duration', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T09:00:00', duration: 'PT90M' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-05-10T10:30:00+03:00')
  })

  it('prefers an explicit end over a duration', () => {
    const event = normalizeEvent(
      {
        id: 'a',
        start: '2026-05-10T09:00:00',
        end: '2026-05-10T10:00:00',
        duration: 'PT90M'
      },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-05-10T10:00:00+03:00')
  })

  it('carries an event across midnight', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T23:00:00', end: '2026-05-11T01:00:00' },
      KYIV
    )

    expect(toIso(event.start)).toBe('2026-05-10T23:00:00+03:00')
    expect(toIso(event.end)).toBe('2026-05-11T01:00:00+03:00')
  })

  it('reads an absolute instant into the context zone', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T06:00:00Z' },
      KYIV
    )

    expect(toIso(event.start)).toBe('2026-05-10T09:00:00+03:00')
  })

  it('renders an event written in another zone', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T09:00:00', timeZone: 'Europe/Kyiv' },
      BERLIN
    )

    expect(toIso(event.start)).toBe('2026-05-10T08:00:00+02:00')
  })
})

describe('all-day events', () => {
  it('is inferred from date-only input', () => {
    const event = normalizeEvent({ id: 'a', start: '2026-03-15' }, KYIV)

    expect(event.allDay).toBe(true)
    expect(toIso(event.start)).toBe('2026-03-15')
    expect(toIso(event.end)).toBe('2026-03-16')
  })

  it('treats the end as exclusive', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-15', end: '2026-03-18' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-03-18')
  })

  it('reads an end equal to the start as a single day', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-15', end: '2026-03-15' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-03-16')
  })

  it('derives a span from a duration in days', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-15', duration: 'P3D' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-03-18')
  })

  it('never collapses to nothing when a duration is shorter than a day', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-15', duration: 'PT4H' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-03-16')
  })

  it('takes the wall date of the zone it is read in', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-16T01:00:00Z', allDay: true },
      LOS_ANGELES
    )

    expect(toIso(event.start)).toBe('2026-03-15')
  })

  it('drops the clock from a forced all-day input', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-15T23:30:00', allDay: true },
      KYIV
    )

    expect(toIso(event.start)).toBe('2026-03-15')
    expect(toIso(event.end)).toBe('2026-03-16')
  })

  it('stays timed when the flag says so', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-03-15', allDay: false },
      KYIV
    )

    expect(event.allDay).toBe(false)
    expect(toIso(event.start)).toBe('2026-03-15T00:00:00+02:00')
  })
})

describe('narrowing', () => {
  it('separates the two shapes', () => {
    const timed = normalizeEvent(
      { id: 'a', start: '2026-05-10T09:00:00' },
      KYIV
    )
    const allDay = normalizeEvent({ id: 'b', start: '2026-05-10' }, KYIV)

    expect(isTimedEvent(timed)).toBe(true)
    expect(isAllDayEvent(timed)).toBe(false)
    expect(isTimedEvent(allDay)).toBe(false)
    expect(isAllDayEvent(allDay)).toBe(true)
  })
})

describe('payload', () => {
  it('passes user data through untouched', () => {
    const data = { title: 'Standup' }
    const event = normalizeEvent(
      { id: 'a', start: '2026-05-10T09:00:00', data },
      KYIV
    )

    expect(event.data).toBe(data)
  })
})

describe('invalid input', () => {
  it('rejects a timed event that ends before it starts', () => {
    expect(() =>
      normalizeEvent(
        {
          id: 'broken',
          start: '2026-05-10T10:00:00',
          end: '2026-05-10T09:00:00'
        },
        KYIV
      )
    ).toThrow(InvalidEventError)
  })

  it('names the offending event', () => {
    try {
      normalizeEvent(
        { id: 'broken', start: '2026-03-18', end: '2026-03-15' },
        KYIV
      )
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEventError)
      expect((error as InvalidEventError).eventId).toBe('broken')
      expect((error as InvalidEventError).message).toContain('broken')
    }
  })

  it('wraps an unreadable start and keeps the cause', () => {
    try {
      normalizeEvent({ id: 'broken', start: 'yesterday' }, KYIV)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEventError)
      expect((error as InvalidEventError).cause).toBeInstanceOf(RangeError)
    }
  })

  it('wraps an unreadable end', () => {
    expect(() =>
      normalizeEvent(
        { id: 'broken', start: '2026-05-10T09:00:00', end: 'later' },
        KYIV
      )
    ).toThrow(InvalidEventError)
  })

  it('wraps an unreadable all-day end', () => {
    expect(() =>
      normalizeEvent({ id: 'broken', start: '2026-03-15', end: 'soon' }, KYIV)
    ).toThrow(InvalidEventError)
  })

  it('wraps an unreadable duration', () => {
    expect(() =>
      normalizeEvent(
        { id: 'broken', start: '2026-05-10T09:00:00', duration: 'a while' },
        KYIV
      )
    ).toThrow(InvalidEventError)
  })

  it('wraps an unreadable all-day start', () => {
    expect(() =>
      normalizeEvent({ id: 'broken', start: '2026-13-45' }, KYIV)
    ).toThrow(InvalidEventError)
  })
})

describe('normalizeEvents', () => {
  it('keeps the order it was given', () => {
    const events = normalizeEvents(
      [
        { id: 'c', start: '2026-05-12T09:00:00' },
        { id: 'a', start: '2026-05-10T09:00:00' },
        { id: 'b', start: '2026-05-11' }
      ],
      KYIV
    )

    expect(events.map((event) => event.id)).toEqual(['c', 'a', 'b'])
    expect(events.map((event) => event.allDay)).toEqual([false, false, true])
  })
})
