import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput } from '#src/event'
import { buildRange } from '#src/range'
import type { RangeSpec } from '#src/range'
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
  spec: RangeSpec = base
): PlacedEvent[][] =>
  buildLayout(
    buildRange(spec),
    normalizeEvents(inputs, { timeZone: spec.timeZone })
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
  const spec = { ...base, view: 'days', dayCount: 3 } as const
  const days = layoutOf(
    [{ id: 'a', start: '2026-03-18T22:00', end: '2026-03-20T02:00' }],
    spec
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

  it('fills the whole of a day in the middle', () => {
    const [placed] = days[1]

    expect(placed.top).toBe(0)
    expect(placed.height).toBe(1)
    expect(placed).toMatchObject({
      continuesBefore: true,
      continuesAfter: true
    })
  })

  it('clips the last day to the end of the event', () => {
    const [placed] = days[2]

    expect(placed.startMinute).toBe(0)
    expect(placed.endMinute).toBe(2 * MINUTES_IN_HOUR)
    expect(placed).toMatchObject({
      continuesBefore: true,
      continuesAfter: false
    })
  })
})

describe('day boundaries', () => {
  const spec = { ...base, view: 'days', dayCount: 2 } as const

  it('leaves out an event that ends when the day starts', () => {
    const days = layoutOf(
      [{ id: 'a', start: '2026-03-18T23:00', end: '2026-03-19T00:00' }],
      spec
    )

    expect(idsOf(days[0])).toEqual(['a'])
    expect(days[1]).toHaveLength(0)
  })

  it('keeps a zero-length event that lands on midnight', () => {
    const days = layoutOf([{ id: 'a', start: '2026-03-19T00:00' }], spec)

    expect(days[0]).toHaveLength(0)
    expect(idsOf(days[1])).toEqual(['a'])
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
