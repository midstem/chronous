import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput } from '#src/event'
import { buildRange } from '#src/range'
import type { CalendarRange } from '#src/range'
import { DAYS_IN_WEEK } from '#src/time'

import { buildLanes } from '../index'
import type { LaneRow, PlacedSpan } from '../types'

const KYIV = 'Europe/Kyiv'
const ANCHOR = '2026-03-18'
const WEEK_STARTS = [0, 1, 2, 3, 4, 5, 6] as const
const AGENDA_DAYS = 30
const WEDNESDAY_INDEX = 2

const base: CalendarRange = { date: ANCHOR, timeZone: KYIV, view: 'week' }

const rowsOf = (
  inputs: readonly EventInput[],
  range: CalendarRange = base
): LaneRow[] =>
  buildLanes(
    buildRange(range),
    normalizeEvents(inputs, { timeZone: range.timeZone })
  )

const spansOf = (
  inputs: readonly EventInput[],
  range: CalendarRange = base
): PlacedSpan[] => rowsOf(inputs, range)[0].spans

const idsOf = (spans: readonly PlacedSpan[]): string[] =>
  spans.map((span) => span.event.id)

const allDay = (id: string, start: string, end?: string): EventInput => ({
  id,
  start,
  end
})

describe('placing one bar', () => {
  it('covers the day it falls on', () => {
    const [span] = spansOf([allDay('a', ANCHOR)])

    expect(span).toMatchObject({
      startDay: WEDNESDAY_INDEX,
      endDay: WEDNESDAY_INDEX + 1,
      dayCount: 1,
      lane: 0,
      lanes: 1,
      continuesBefore: false,
      continuesAfter: false
    })
    expect(span.left).toBe(WEDNESDAY_INDEX / DAYS_IN_WEEK)
    expect(span.width).toBe(1 / DAYS_IN_WEEK)
    expect(span.start.toString()).toBe(ANCHOR)
    expect(span.end.toString()).toBe('2026-03-19')
  })

  it('reads the end as exclusive', () => {
    const [span] = spansOf([allDay('a', '2026-03-16', '2026-03-18')])

    expect(span).toMatchObject({ startDay: 0, endDay: 2, dayCount: 2 })
    expect(span.end.toString()).toBe('2026-03-18')
  })

  it('keeps a one-day event when the end repeats the start', () => {
    const [span] = spansOf([allDay('a', ANCHOR, ANCHOR)])

    expect(span.dayCount).toBe(1)
  })

  it('leaves a row empty when nothing lands in it', () => {
    const [row] = rowsOf([allDay('a', '2026-04-01')])

    expect(row).toMatchObject({ lanes: 0, dayCount: DAYS_IN_WEEK })
    expect(row.spans).toEqual([])
    expect(row.start.toString()).toBe('2026-03-16')
    expect(row.end.toString()).toBe('2026-03-23')
  })
})

describe('stacking bars into lanes', () => {
  it('drops an overlapping bar into the next lane', () => {
    const spans = spansOf([
      allDay('a', '2026-03-16', '2026-03-19'),
      allDay('b', '2026-03-17', '2026-03-20')
    ])

    expect(spans.map((span) => span.lane)).toEqual([0, 1])
    expect(spans.every((span) => span.lanes === 2)).toBe(true)
  })

  it('reuses a lane once the bar before it ends', () => {
    const spans = spansOf([
      allDay('a', '2026-03-16', '2026-03-18'),
      allDay('b', '2026-03-18', '2026-03-20')
    ])

    expect(spans.map((span) => span.lane)).toEqual([0, 0])
    expect(spans.every((span) => span.lanes === 1)).toBe(true)
  })

  it('reads across the row, longest first, then by id', () => {
    const spans = spansOf([
      allDay('c', '2026-03-17', '2026-03-19'),
      allDay('b', '2026-03-17', '2026-03-19'),
      allDay('a', '2026-03-17', '2026-03-20'),
      allDay('d', '2026-03-16', '2026-03-17'),
      allDay('e', '2026-03-17', '2026-03-19')
    ])

    expect(idsOf(spans)).toEqual(['d', 'a', 'b', 'c', 'e'])
  })

  it('keeps bars that share an id in the order they came in', () => {
    const spans = spansOf([
      { ...allDay('a', ANCHOR), data: 'first' },
      { ...allDay('a', ANCHOR), data: 'second' }
    ])

    expect(spans.map((span) => span.event.data)).toEqual(['first', 'second'])
    expect(spans.map((span) => span.lane)).toEqual([0, 1])
  })
})

describe('clipping to the row', () => {
  it('flags a bar that runs past both edges', () => {
    const [span] = spansOf([allDay('a', '2026-03-10', '2026-03-25')])

    expect(span).toMatchObject({
      startDay: 0,
      endDay: DAYS_IN_WEEK,
      dayCount: DAYS_IN_WEEK,
      left: 0,
      width: 1,
      continuesBefore: true,
      continuesAfter: true
    })
  })
})

describe('timed events', () => {
  const timed = (id: string, start: string, end: string): EventInput => ({
    id,
    start,
    end
  })

  it('leaves an event shorter than a day in the grid', () => {
    expect(
      spansOf([timed('a', '2026-03-18T22:00', '2026-03-19T02:00')])
    ).toEqual([])
  })

  it('lifts an event of a whole day into a lane', () => {
    const [span] = spansOf([timed('a', '2026-03-18T09:00', '2026-03-19T09:00')])

    expect(span).toMatchObject({ startDay: 2, endDay: 4, dayCount: 2 })
  })

  it('leaves an event five minutes short of a day in the grid', () => {
    expect(
      spansOf([timed('a', '2026-03-18T09:00', '2026-03-19T08:55')])
    ).toEqual([])
  })

  it('lifts an event that runs over several days', () => {
    const [span] = spansOf([timed('a', '2026-03-17T22:00', '2026-03-20T02:00')])

    expect(span).toMatchObject({ dayCount: 4, continuesAfter: false })
  })
})

describe('a month grid', () => {
  const range: CalendarRange = { ...base, view: 'month' }

  it('breaks a bar at the week boundary', () => {
    const rows = rowsOf([allDay('a', ANCHOR, '2026-03-25')], range)
    const [before] = rows[3].spans
    const [after] = rows[4].spans

    expect(before).toMatchObject({
      startDay: WEDNESDAY_INDEX,
      endDay: DAYS_IN_WEEK,
      continuesBefore: false,
      continuesAfter: true
    })
    expect(after).toMatchObject({
      startDay: 0,
      dayCount: 2,
      continuesBefore: true,
      continuesAfter: false
    })
  })

  it('carries bars on the days around the month', () => {
    const rows = rowsOf([allDay('a', '2026-02-24')], range)

    expect(idsOf(rows[0].spans)).toEqual(['a'])
  })

  it.each(WEEK_STARTS)('cuts into whole weeks from day %d', (weekStartsOn) => {
    const weekly: CalendarRange = { ...range, weekStartsOn }
    const rows = rowsOf([allDay('a', '2026-03-10', '2026-04-02')], weekly)
    const built = buildRange(weekly)

    expect(rows.length * DAYS_IN_WEEK).toBe(built.days.length)
    expect(rows.every((row) => row.dayCount === DAYS_IN_WEEK)).toBe(true)
    expect(
      rows.every((row) =>
        row.spans.every((span) => span.dayCount <= DAYS_IN_WEEK)
      )
    ).toBe(true)
    expect(new Set(rows.map((row) => row.start.dayOfWeek)).size).toBe(1)
  })
})

describe('views without week rows', () => {
  it('gives a day view a row of its own', () => {
    const rows = rowsOf([allDay('a', ANCHOR)], { ...base, view: 'day' })

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ dayCount: 1, lanes: 1 })
    expect(rows[0].spans[0]).toMatchObject({ left: 0, width: 1 })
  })

  it('keeps an agenda in one row', () => {
    const rows = rowsOf([allDay('a', ANCHOR)], { ...base, view: 'agenda' })

    expect(rows).toHaveLength(1)
    expect(rows[0].dayCount).toBe(AGENDA_DAYS)
  })
})
