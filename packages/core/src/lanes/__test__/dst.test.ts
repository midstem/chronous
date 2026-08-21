import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput } from '#src/event'
import { buildRange } from '#src/range'
import type { RangeSpec } from '#src/range'
import { DAYS_IN_WEEK } from '#src/time'

import { buildLanes } from '../index'
import type { PlacedSpan } from '../types'

const KYIV = 'Europe/Kyiv'
const SANTIAGO = 'America/Santiago'
const THREE_DAYS = 3

const TRANSITIONS: [string, string][] = [
  ['Europe/Kyiv', '2026-10-25'],
  ['Europe/Kyiv', '2026-03-29'],
  ['Australia/Lord_Howe', '2026-04-05'],
  ['Australia/Lord_Howe', '2026-10-04'],
  ['America/Santiago', '2026-09-06'],
  ['Asia/Kolkata', '2026-03-29']
]

const spansOn = (
  spec: RangeSpec,
  inputs: readonly EventInput[]
): PlacedSpan[] =>
  buildLanes(
    buildRange(spec),
    normalizeEvents(inputs, { timeZone: spec.timeZone })
  )[0].spans

describe('all-day bars ignore the clock', () => {
  it.each(TRANSITIONS)('covers one day in %s on %s', (timeZone, date) => {
    const [span] = spansOn({ view: 'day', date, timeZone }, [
      { id: 'a', start: date }
    ])

    expect(span).toMatchObject({
      startDay: 0,
      days: 1,
      left: 0,
      width: 1,
      continuesBefore: false,
      continuesAfter: false
    })
    expect(span.start.toString()).toBe(date)
  })

  it.each(TRANSITIONS)('fills a week in %s over %s', (timeZone, date) => {
    const range = buildRange({ view: 'week', date, timeZone })
    const [span] = spansOn({ view: 'week', date, timeZone }, [
      {
        id: 'a',
        start: range.days[0].date.toString(),
        end: range.days[DAYS_IN_WEEK - 1].date.add({ days: 1 }).toString()
      }
    ])

    expect(span).toMatchObject({
      days: DAYS_IN_WEEK,
      width: 1,
      continuesBefore: false,
      continuesAfter: false
    })
  })

  it('lands on the day whose midnight the zone skips', () => {
    const spec: RangeSpec = {
      view: 'days',
      date: '2026-09-05',
      timeZone: SANTIAGO,
      dayCount: THREE_DAYS
    }
    const [span] = spansOn(spec, [{ id: 'a', start: '2026-09-06' }])

    expect(span).toMatchObject({ startDay: 1, days: 1 })
  })
})

describe('a day is measured by the wall clock', () => {
  const week: RangeSpec = { view: 'week', date: '2026-03-25', timeZone: KYIV }

  it('lifts twenty-three elapsed hours that fill a short day', () => {
    const [span] = spansOn(week, [
      { id: 'a', start: '2026-03-28T09:00', end: '2026-03-29T09:00' }
    ])

    expect(span).toMatchObject({ days: 2 })
  })

  it('lifts the same wall span on a week without a transition', () => {
    const [span] = spansOn({ ...week, date: '2026-03-18' }, [
      { id: 'a', start: '2026-03-18T09:00', end: '2026-03-19T09:00' }
    ])

    expect(span).toMatchObject({ days: 2 })
  })

  it('lifts twenty-five elapsed hours that fill a long day', () => {
    const [span] = spansOn({ ...week, date: '2026-10-21' }, [
      { id: 'a', start: '2026-10-24T09:00', end: '2026-10-25T09:00' }
    ])

    expect(span).toMatchObject({ days: 2 })
  })

  it('leaves twenty-three elapsed hours inside a long day in the grid', () => {
    expect(
      spansOn({ ...week, date: '2026-10-21' }, [
        { id: 'a', start: '2026-10-24T09:00', duration: 'PT23H' }
      ])
    ).toEqual([])
  })
})
