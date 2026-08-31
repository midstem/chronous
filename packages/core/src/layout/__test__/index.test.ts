import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput } from '#src/event'
import { buildRange } from '#src/range'
import type { CalendarRange } from '#src/range'
import { MINUTES_IN_DAY, toIso } from '#src/time'

import { buildLayout } from '../index'
import type { PlacedEvent } from '../types'

const KYIV = 'Europe/Kyiv'
const ANCHOR = '2026-03-18'
const MINUTES_IN_HOUR = 60
const HALF = 0.5
const THIRD = 1 / 3

const base = { date: ANCHOR, timeZone: KYIV, view: 'day' } as const

const layoutOf = (
  inputs: readonly EventInput[],
  range: CalendarRange = base
): PlacedEvent[][] =>
  buildLayout(
    buildRange(range),
    normalizeEvents(inputs, { timeZone: range.timeZone })
  ).days.map((day) => day.events)

const timed = (id: string, start: string, end?: string): EventInput => ({
  id,
  start: `${ANCHOR}T${start}`,
  end: end === undefined ? undefined : `${ANCHOR}T${end}`
})

const idsOf = (events: readonly PlacedEvent[]): string[] =>
  events.map((placed) => placed.event.id)

describe('placing one event', () => {
  it('gives it the whole width and a wall-clock box', () => {
    const [placed] = layoutOf([timed('a', '09:00', '10:00')])[0]

    expect(placed.startMinute).toBe(9 * MINUTES_IN_HOUR)
    expect(placed.endMinute).toBe(10 * MINUTES_IN_HOUR)
    expect(placed.minutes).toBe(MINUTES_IN_HOUR)
    expect(placed.top).toBe((9 * MINUTES_IN_HOUR) / MINUTES_IN_DAY)
    expect(placed.height).toBe(MINUTES_IN_HOUR / MINUTES_IN_DAY)
    expect(placed).toMatchObject({
      column: 0,
      columns: 1,
      span: 1,
      left: 0,
      width: 1,
      continuesBefore: false,
      continuesAfter: false
    })
  })

  it('keeps a zero-length event as a zero-height box', () => {
    const [placed] = layoutOf([timed('a', '09:00')])[0]

    expect(placed.startMinute).toBe(placed.endMinute)
    expect(placed.height).toBe(0)
    expect(placed.minutes).toBe(0)
  })

  it('ignores all-day events', () => {
    expect(layoutOf([{ id: 'a', start: ANCHOR }])[0]).toHaveLength(0)
  })
})

describe('sharing the width', () => {
  it('splits two overlapping events down the middle', () => {
    const [first, second] = layoutOf([
      timed('a', '09:00', '10:00'),
      timed('b', '09:30', '10:30')
    ])[0]

    expect(first).toMatchObject({ column: 0, columns: 2, left: 0, width: HALF })
    expect(second).toMatchObject({ column: 1, left: HALF, width: HALF })
  })

  it('reuses a column once the earlier event has ended', () => {
    const events = layoutOf([
      timed('a', '09:00', '10:00'),
      timed('b', '09:30', '10:30'),
      timed('c', '10:00', '11:00')
    ])[0]

    expect(events.map((placed) => placed.column)).toEqual([0, 1, 0])
    expect(events.every((placed) => placed.columns === 2)).toBe(true)
  })

  it('starts a fresh cluster when nothing overlaps', () => {
    const events = layoutOf([
      timed('a', '09:00', '10:00'),
      timed('b', '10:00', '11:00')
    ])[0]

    expect(events.every((placed) => placed.width === 1)).toBe(true)
    expect(events.every((placed) => placed.columns === 1)).toBe(true)
  })

  it('stacks events that start on the same minute', () => {
    const events = layoutOf([timed('a', '09:00'), timed('b', '09:00')])[0]

    expect(events.map((placed) => placed.column)).toEqual([0, 1])
    expect(events.every((placed) => placed.width === HALF)).toBe(true)
  })
})

describe('expanding into free columns', () => {
  it('widens an event until it meets a neighbour', () => {
    const events = layoutOf([
      timed('a', '09:00', '11:00'),
      timed('b', '09:00', '09:30'),
      timed('c', '09:00', '09:30'),
      timed('d', '09:30', '10:00')
    ])[0]
    const placed = Object.fromEntries(
      events.map((item) => [item.event.id, item])
    )

    expect(placed.a).toMatchObject({ column: 0, columns: 3, span: 1 })
    expect(placed.d).toMatchObject({ column: 1, span: 2 })
    expect(placed.d.left).toBeCloseTo(THIRD)
    expect(placed.d.width).toBeCloseTo(2 * THIRD)
  })
})

describe('ordering', () => {
  it('reads down the day, longest first, then by id', () => {
    const events = layoutOf([
      timed('c', '09:00', '09:30'),
      timed('b', '09:00', '09:30'),
      timed('a', '09:00', '10:00'),
      timed('d', '08:00', '08:30')
    ])[0]

    expect(idsOf(events)).toEqual(['d', 'a', 'b', 'c'])
  })

  it('keeps events that share an id in the order they came in', () => {
    const events = layoutOf([
      { ...timed('a', '09:00', '10:00'), data: 'first' },
      { ...timed('a', '09:00', '10:00'), data: 'second' }
    ])[0]

    expect(events.map((placed) => placed.event.data)).toEqual([
      'first',
      'second'
    ])
    expect(events.map((placed) => placed.column)).toEqual([0, 1])
  })
})

describe('events that cross midnight', () => {
  const range = { ...base, view: 'days', dayCount: 2 } as const
  const days = layoutOf(
    [{ id: 'a', start: '2026-03-18T22:00', end: '2026-03-19T02:00' }],
    range
  )

  it('clips the first day to the end of the grid', () => {
    const [placed] = days[0]

    expect(placed.startMinute).toBe(22 * MINUTES_IN_HOUR)
    expect(placed.endMinute).toBe(MINUTES_IN_DAY)
    expect(placed.minutes).toBe(2 * MINUTES_IN_HOUR)
    expect(placed).toMatchObject({
      continuesBefore: false,
      continuesAfter: true
    })
    expect(toIso(placed.end)).toBe('2026-03-19T00:00:00+02:00')
  })

  it('clips the last day to the end of the event', () => {
    const [placed] = days[1]

    expect(placed.startMinute).toBe(0)
    expect(placed.endMinute).toBe(2 * MINUTES_IN_HOUR)
    expect(placed).toMatchObject({
      continuesBefore: true,
      continuesAfter: false
    })
  })
})

describe('events of a whole day or longer', () => {
  const range = { ...base, view: 'days', dayCount: 3 } as const
  const input = { id: 'a', start: '2026-03-18T22:00', end: '2026-03-20T02:00' }

  it('leaves the grid for a lane', () => {
    expect(layoutOf([input], range).flat()).toEqual([])
  })

  it('is placed as one bar across the days it covers', () => {
    const [span] = buildLayout(
      buildRange(range),
      normalizeEvents([input], { timeZone: KYIV })
    ).rows[0].spans

    expect(span.event.id).toBe('a')
    expect(span).toMatchObject({ startDay: 0, dayCount: 3 })
  })
})

describe('day boundaries', () => {
  const range = { ...base, view: 'days', dayCount: 2 } as const

  it('leaves out an event that ends when the day starts', () => {
    const days = layoutOf(
      [{ id: 'a', start: '2026-03-18T23:00', end: '2026-03-19T00:00' }],
      range
    )

    expect(idsOf(days[0])).toEqual(['a'])
    expect(days[1]).toHaveLength(0)
  })

  it('keeps a zero-length event that lands on midnight', () => {
    const days = layoutOf([{ id: 'a', start: '2026-03-19T00:00' }], range)

    expect(days[0]).toHaveLength(0)
    expect(idsOf(days[1])).toEqual(['a'])
  })
})

describe('a range of several days', () => {
  const range = { ...base, view: 'days', dayCount: 4 } as const

  it('clips an event that starts before the range', () => {
    const days = layoutOf(
      [{ id: 'a', start: '2026-03-17T22:00', end: '2026-03-18T02:00' }],
      range
    )

    expect(idsOf(days[0])).toEqual(['a'])
    expect(days[0][0]).toMatchObject({ continuesBefore: true })
    expect(days[1]).toHaveLength(0)
  })

  it('leaves out events that fall outside it', () => {
    const days = layoutOf(
      [
        { id: 'before', start: '2026-03-16T09:00', end: '2026-03-16T10:00' },
        { id: 'after', start: '2026-03-25T09:00', end: '2026-03-25T10:00' }
      ],
      range
    )

    expect(days.flat()).toEqual([])
  })

  it('carries an event over midnight and stops where it ends', () => {
    const days = layoutOf(
      [{ id: 'a', start: '2026-03-19T23:00', end: '2026-03-20T01:00' }],
      range
    )

    expect(days[0]).toHaveLength(0)
    expect(idsOf(days[1])).toEqual(['a'])
    expect(idsOf(days[2])).toEqual(['a'])
    expect(days[2][0]).toMatchObject({
      continuesBefore: true,
      continuesAfter: false
    })
    expect(days[3]).toHaveLength(0)
  })
})

describe('views without a time grid', () => {
  it('still places timed events on the month cells', () => {
    const days = layoutOf([timed('a', '09:00', '10:00')], {
      ...base,
      view: 'month'
    })
    const placed = days.flat()

    expect(placed).toHaveLength(1)
    expect(placed[0].top).toBe((9 * MINUTES_IN_HOUR) / MINUTES_IN_DAY)
  })
})
