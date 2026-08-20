import { describe, expect, it } from 'vitest'

import { minutesBetween, toIso } from '#src/time'

import { InvalidEventError, isTimedEvent, normalizeEvent } from '../index'
import type { EventInput, NormalizeContext, TimedEvent } from '../types'

const KYIV: NormalizeContext = { timeZone: 'Europe/Kyiv' }
const NEW_YORK: NormalizeContext = { timeZone: 'America/New_York' }

const MINUTES_IN_HOUR = 60

const timedEvent = (
  input: EventInput,
  context: NormalizeContext
): TimedEvent => {
  const event = normalizeEvent(input, context)

  if (!isTimedEvent(event)) throw new Error(`Event "${input.id}" is all-day.`)

  return event
}

describe('an event starting in a spring-forward gap', () => {
  const START = '2026-03-29T03:30:00'

  it('moves to the far side of the gap by default', () => {
    const event = normalizeEvent({ id: 'a', start: START }, KYIV)

    expect(toIso(event.start)).toBe('2026-03-29T04:30:00+03:00')
  })

  it('honours an earlier disambiguation', () => {
    const event = normalizeEvent(
      { id: 'a', start: START },
      { ...KYIV, disambiguation: 'earlier' }
    )

    expect(toIso(event.start)).toBe('2026-03-29T02:30:00+02:00')
  })

  it('is reported as invalid when the context rejects gaps', () => {
    expect(() =>
      normalizeEvent(
        { id: 'broken', start: START },
        { ...KYIV, disambiguation: 'reject' }
      )
    ).toThrow(InvalidEventError)
  })
})

describe('an event starting in a doubled hour', () => {
  const START = '2026-10-25T03:30:00'

  it('takes the first occurrence by default', () => {
    const event = normalizeEvent({ id: 'a', start: START }, KYIV)

    expect(toIso(event.start)).toBe('2026-10-25T03:30:00+03:00')
  })

  it('takes the second occurrence when asked', () => {
    const event = normalizeEvent(
      { id: 'a', start: START },
      { ...KYIV, disambiguation: 'later' }
    )

    expect(toIso(event.start)).toBe('2026-10-25T03:30:00+02:00')
  })
})

describe('durations across a transition', () => {
  it('spends four real hours over the fall back', () => {
    const event = timedEvent(
      { id: 'a', start: '2026-10-25T01:00:00', duration: 'PT4H' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-10-25T04:00:00+02:00')
    expect(minutesBetween(event.start, event.end)).toBe(4 * MINUTES_IN_HOUR)
  })

  it('keeps the wall clock for a day long duration', () => {
    const event = timedEvent(
      { id: 'a', start: '2026-10-24T09:00:00', duration: 'P1D' },
      KYIV
    )

    expect(toIso(event.end)).toBe('2026-10-25T09:00:00+02:00')
    expect(minutesBetween(event.start, event.end)).toBe(25 * MINUTES_IN_HOUR)
  })

  it('turns a four hour wall clock span into five real hours', () => {
    const event = timedEvent(
      { id: 'a', start: '2026-10-25T01:00:00', end: '2026-10-25T05:00:00' },
      KYIV
    )

    expect(minutesBetween(event.start, event.end)).toBe(5 * MINUTES_IN_HOUR)
  })

  it('turns an eight hour overnight span into seven real hours', () => {
    const event = timedEvent(
      { id: 'a', start: '2026-03-28T22:00:00', end: '2026-03-29T06:00:00' },
      KYIV
    )

    expect(minutesBetween(event.start, event.end)).toBe(7 * MINUTES_IN_HOUR)
  })
})

describe('all-day events on a transition day', () => {
  it('stays a plain date when the day is short', () => {
    const event = normalizeEvent({ id: 'a', start: '2026-03-29' }, KYIV)

    expect(event.allDay).toBe(true)
    expect(toIso(event.start)).toBe('2026-03-29')
    expect(toIso(event.end)).toBe('2026-03-30')
  })

  it('stays a plain date when the day is long', () => {
    const event = normalizeEvent({ id: 'a', start: '2026-10-25' }, KYIV)

    expect(toIso(event.start)).toBe('2026-10-25')
  })
})

describe('zones whose transitions fall on different dates', () => {
  it('renders a Kyiv event in New York while only New York is on DST', () => {
    const event = normalizeEvent(
      { id: 'a', start: '2026-10-25T12:00:00', timeZone: 'Europe/Kyiv' },
      NEW_YORK
    )

    expect(toIso(event.start)).toBe('2026-10-25T06:00:00-04:00')
  })
})
