import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput, NormalizeContext } from '#src/event'
import { minutesBetween, toIso, zoned } from '#src/time'

import { expandEvents } from '../index'

const HOUR = 60

const expand = (
  input: EventInput,
  timeZone: string,
  from: string,
  to: string
): string[][] => {
  const context: NormalizeContext = { timeZone }
  const window = {
    start: zoned(from, timeZone),
    end: zoned(to, timeZone)
  }

  return expandEvents(normalizeEvents([input], context), window, context).map(
    (event) => [toIso(event.start), toIso(event.end)]
  )
}

const daily = (start: string, duration = 'PT1H'): EventInput => ({
  id: 'a',
  start,
  duration,
  recurrence: { rule: 'FREQ=DAILY;COUNT=3' }
})

const elapsed = (
  input: EventInput,
  timeZone: string,
  from: string,
  to: string
): number[] => {
  const context: NormalizeContext = { timeZone }
  const window = {
    start: zoned(from, timeZone),
    end: zoned(to, timeZone)
  }

  return expandEvents(normalizeEvents([input], context), window, context).map(
    (event) =>
      event.allDay ? 0 : minutesBetween(event.start, event.end) / HOUR
  )
}

describe('Europe/Kyiv spring forward', () => {
  it('keeps the wall time of every instance', () => {
    expect(
      expand(
        daily('2026-03-28T09:00:00'),
        'Europe/Kyiv',
        '2026-03-01',
        '2026-04-05'
      )
    ).toEqual([
      ['2026-03-28T09:00:00+02:00', '2026-03-28T10:00:00+02:00'],
      ['2026-03-29T09:00:00+03:00', '2026-03-29T10:00:00+03:00'],
      ['2026-03-30T09:00:00+03:00', '2026-03-30T10:00:00+03:00']
    ])
  })

  it('pushes an instance out of the gap', () => {
    expect(
      expand(
        daily('2026-03-28T03:30:00'),
        'Europe/Kyiv',
        '2026-03-01',
        '2026-04-05'
      )
    ).toEqual([
      ['2026-03-28T03:30:00+02:00', '2026-03-28T04:30:00+02:00'],
      ['2026-03-29T04:30:00+03:00', '2026-03-29T05:30:00+03:00'],
      ['2026-03-30T03:30:00+03:00', '2026-03-30T04:30:00+03:00']
    ])
  })

  it('reads an instance across the gap the way a literal event reads', () => {
    expect(
      expand(
        daily('2026-03-28T02:00:00', 'PT2H'),
        'Europe/Kyiv',
        '2026-03-01',
        '2026-04-05'
      )[1]
    ).toEqual(['2026-03-29T02:00:00+02:00', '2026-03-29T04:00:00+03:00'])
  })

  it('shortens the elapsed hour that the gap swallows', () => {
    expect(
      elapsed(
        daily('2026-03-28T02:00:00', 'PT2H'),
        'Europe/Kyiv',
        '2026-03-01',
        '2026-04-05'
      )
    ).toEqual([2, 1, 2])
  })
})

describe('Europe/Kyiv fall back', () => {
  it('takes the earlier side of the doubled hour', () => {
    expect(
      expand(
        daily('2026-10-24T03:30:00'),
        'Europe/Kyiv',
        '2026-10-01',
        '2026-11-05'
      )
    ).toEqual([
      ['2026-10-24T03:30:00+03:00', '2026-10-24T04:30:00+03:00'],
      ['2026-10-25T03:30:00+03:00', '2026-10-25T04:30:00+02:00'],
      ['2026-10-26T03:30:00+02:00', '2026-10-26T04:30:00+02:00']
    ])
  })

  it('stretches the elapsed hour that the fold repeats', () => {
    expect(
      elapsed(
        daily('2026-10-24T03:30:00'),
        'Europe/Kyiv',
        '2026-10-01',
        '2026-11-05'
      )
    ).toEqual([1, 2, 1])
  })
})

describe('Australia/Lord_Howe', () => {
  it('crosses a half-hour fall back', () => {
    expect(
      expand(
        daily('2026-04-04T01:45:00'),
        'Australia/Lord_Howe',
        '2026-04-01',
        '2026-04-10'
      )
    ).toEqual([
      ['2026-04-04T01:45:00+11:00', '2026-04-04T02:45:00+11:00'],
      ['2026-04-05T01:45:00+11:00', '2026-04-05T02:45:00+10:30'],
      ['2026-04-06T01:45:00+10:30', '2026-04-06T02:45:00+10:30']
    ])
  })

  it('crosses a half-hour spring forward', () => {
    expect(
      expand(
        daily('2026-10-03T01:45:00'),
        'Australia/Lord_Howe',
        '2026-10-01',
        '2026-10-10'
      )
    ).toEqual([
      ['2026-10-03T01:45:00+10:30', '2026-10-03T02:45:00+10:30'],
      ['2026-10-04T01:45:00+10:30', '2026-10-04T02:45:00+11:00'],
      ['2026-10-05T01:45:00+11:00', '2026-10-05T02:45:00+11:00']
    ])
  })
})

describe('America/Santiago', () => {
  it('moves an instance off a day that has no midnight', () => {
    expect(
      expand(
        daily('2026-09-05T00:30:00'),
        'America/Santiago',
        '2026-09-01',
        '2026-09-10'
      )
    ).toEqual([
      ['2026-09-05T00:30:00-04:00', '2026-09-05T01:30:00-04:00'],
      ['2026-09-06T01:30:00-03:00', '2026-09-06T02:30:00-03:00'],
      ['2026-09-07T00:30:00-03:00', '2026-09-07T01:30:00-03:00']
    ])
  })
})

describe('Asia/Kolkata', () => {
  it('holds one offset all the way through', () => {
    expect(
      expand(
        daily('2026-03-28T09:00:00'),
        'Asia/Kolkata',
        '2026-03-01',
        '2026-04-05'
      )
    ).toEqual([
      ['2026-03-28T09:00:00+05:30', '2026-03-28T10:00:00+05:30'],
      ['2026-03-29T09:00:00+05:30', '2026-03-29T10:00:00+05:30'],
      ['2026-03-30T09:00:00+05:30', '2026-03-30T10:00:00+05:30']
    ])
  })
})

describe('a monthly rule over a transition', () => {
  it('keeps the wall time and moves the offset', () => {
    expect(
      expand(
        {
          id: 'a',
          start: '2026-02-27T09:00:00',
          duration: 'PT1H',
          recurrence: { rule: 'FREQ=MONTHLY;BYDAY=-1FR;COUNT=3' }
        },
        'Europe/Kyiv',
        '2026-01-01',
        '2026-06-01'
      )
    ).toEqual([
      ['2026-02-27T09:00:00+02:00', '2026-02-27T10:00:00+02:00'],
      ['2026-03-27T09:00:00+02:00', '2026-03-27T10:00:00+02:00'],
      ['2026-04-24T09:00:00+03:00', '2026-04-24T10:00:00+03:00']
    ])
  })
})

describe('a series anchored years before a transition', () => {
  const zones = [
    ['Europe/Kyiv', '2026-03-28', '2026-03-31'],
    ['Australia/Lord_Howe', '2026-04-04', '2026-04-07'],
    ['America/Santiago', '2026-09-05', '2026-09-08'],
    ['Asia/Kolkata', '2026-03-28', '2026-03-31']
  ] as const

  const unbounded = (start: string): EventInput => ({
    id: 'a',
    start,
    duration: 'PT1H',
    recurrence: { rule: 'FREQ=DAILY' }
  })

  it.each(zones)('lands where a near anchor lands in %s', (zone, from, to) => {
    const seeked = expand(unbounded('2010-01-01T09:00:00'), zone, from, to)

    expect(seeked).toEqual(
      expand(unbounded(`${from}T09:00:00`), zone, from, to)
    )
    expect(seeked).toHaveLength(3)
  })
})

describe('an all-day series over a transition', () => {
  it('never leaves the calendar date', () => {
    expect(
      expand(
        {
          id: 'a',
          start: '2026-03-28',
          end: '2026-03-30',
          recurrence: { rule: 'FREQ=WEEKLY;COUNT=2' }
        },
        'Europe/Kyiv',
        '2026-03-01',
        '2026-04-30'
      )
    ).toEqual([
      ['2026-03-28', '2026-03-30'],
      ['2026-04-04', '2026-04-06']
    ])
  })
})
