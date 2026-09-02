import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput } from '#src/event'
import { buildRange } from '#src/range'
import type { CalendarRange } from '#src/range'
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
  range: CalendarRange,
  inputs: readonly EventInput[]
): PlacedSpan[] =>
  buildLanes(
    buildRange(range),
    normalizeEvents(inputs, { timeZone: range.timeZone })
  )[0].spans

describe('all-day bars ignore the clock', () => {
  it.each(TRANSITIONS)('covers one day in %s on %s', (timeZone, date) => {
    const [span] = spansOn({ view: 'day', currentDate: date, timeZone }, [
      { id: 'a', start: date }
    ])

    expect(span).toMatchObject({
      startDay: 0,
      dayCount: 1,
      left: 0,
      width: 1,
      continuesBefore: false,
      continuesAfter: false
    })
    expect(span.start.toString()).toBe(date)
  })

  it.each(TRANSITIONS)('fills a week in %s over %s', (timeZone, date) => {
    const built = buildRange({ view: 'week', currentDate: date, timeZone })
    const [span] = spansOn({ view: 'week', currentDate: date, timeZone }, [
      {
        id: 'a',
        start: built.days[0].date.toString(),
        end: built.days[DAYS_IN_WEEK - 1].date.add({ days: 1 }).toString()
      }
    ])

    expect(span).toMatchObject({
      dayCount: DAYS_IN_WEEK,
      width: 1,
      continuesBefore: false,
      continuesAfter: false
    })
  })

  it('lands on the day whose midnight the zone skips', () => {
    const range: CalendarRange = {
      view: 'days',
      currentDate: '2026-09-05',
      timeZone: SANTIAGO,
      dayCount: THREE_DAYS
    }
    const [span] = spansOn(range, [{ id: 'a', start: '2026-09-06' }])

    expect(span).toMatchObject({ startDay: 1, dayCount: 1 })
  })
})

describe('a day is measured by the wall clock', () => {
  const week: CalendarRange = {
    view: 'week',
    currentDate: '2026-03-25',
    timeZone: KYIV
  }

  it('lifts twenty-three elapsed hours that fill a short day', () => {
    const [span] = spansOn(week, [
      { id: 'a', start: '2026-03-28T09:00', end: '2026-03-29T09:00' }
    ])

    expect(span).toMatchObject({ dayCount: 2 })
  })

  it('lifts the same wall span on a week without a transition', () => {
    const [span] = spansOn({ ...week, currentDate: '2026-03-18' }, [
      { id: 'a', start: '2026-03-18T09:00', end: '2026-03-19T09:00' }
    ])

    expect(span).toMatchObject({ dayCount: 2 })
  })

  it('lifts twenty-five elapsed hours that fill a long day', () => {
    const [span] = spansOn({ ...week, currentDate: '2026-10-21' }, [
      { id: 'a', start: '2026-10-24T09:00', end: '2026-10-25T09:00' }
    ])

    expect(span).toMatchObject({ dayCount: 2 })
  })

  it('leaves twenty-three elapsed hours inside a long day in the grid', () => {
    expect(
      spansOn({ ...week, currentDate: '2026-10-21' }, [
        { id: 'a', start: '2026-10-24T09:00', duration: 'PT23H' }
      ])
    ).toEqual([])
  })
})
