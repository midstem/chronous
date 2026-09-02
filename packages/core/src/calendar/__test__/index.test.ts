import { describe, expect, it } from 'vitest'

import { InvalidEventError } from '#src/event'
import type { EventInput } from '#src/event'
import { InvalidRangeError } from '#src/range'
import type { CalendarRange } from '#src/range'
import { MINUTES_IN_DAY } from '#src/time'

import { buildCalendar } from '../index'
import type { CalendarLayout } from '../types'

const KYIV = 'Europe/Kyiv'
const ANCHOR = '2026-03-18'
const WEDNESDAY_INDEX = 2
const THURSDAY_INDEX = 3
const SLOTS_PER_DAY = 24
const MINUTES_IN_HOUR = 60
const MONTH_GRID_DAYS = 42
const MONTH_GRID_ROWS = 6
const AGENDA_DAYS = 30
const HALF = 0.5

const week: CalendarRange = {
  view: 'week',
  currentDate: ANCHOR,
  timeZone: KYIV
}

const calendarOf = (
  inputs: readonly EventInput[] = [],
  range: CalendarRange = week
): CalendarLayout => buildCalendar(range, inputs)

const timed = (id: string, start: string, end: string): EventInput => ({
  id,
  start,
  end
})

describe('the calendar wraps the range', () => {
  it('reports the view and its bounds as ISO strings', () => {
    const calendar = calendarOf()

    expect(calendar.view).toBe('week')
    expect(calendar.start).toBe('2026-03-16T00:00:00+02:00')
    expect(calendar.end).toBe('2026-03-23T00:00:00+02:00')
  })

  it('carries one day per range day', () => {
    const days = calendarOf().days

    expect(days).toHaveLength(7)
    expect(days[WEDNESDAY_INDEX]).toMatchObject({
      date: ANCHOR,
      start: '2026-03-18T00:00:00+02:00',
      end: '2026-03-19T00:00:00+02:00',
      minutes: MINUTES_IN_DAY,
      inCurrentPeriod: true
    })
  })

  it('keeps the wall-clock rows on a day', () => {
    const { slots } = calendarOf().days[WEDNESDAY_INDEX]

    expect(slots).toHaveLength(SLOTS_PER_DAY)
    expect(slots.map((slot) => slot.minuteOfDay)).toEqual(
      Array.from(
        { length: SLOTS_PER_DAY },
        (_, index) => index * MINUTES_IN_HOUR
      )
    )
    expect(slots[9]).toEqual({
      minuteOfDay: 540,
      start: '2026-03-18T09:00:00+02:00',
      end: '2026-03-18T10:00:00+02:00',
      minutes: MINUTES_IN_HOUR
    })
  })

  it('leaves month and agenda days without rows', () => {
    const month = calendarOf([], { ...week, view: 'month' })
    const agenda = calendarOf([], { ...week, view: 'agenda' })

    expect(month.days).toHaveLength(MONTH_GRID_DAYS)
    expect(month.days.every((day) => day.slots.length === 0)).toBe(true)
    expect(agenda.days).toHaveLength(AGENDA_DAYS)
    expect(agenda.days.every((day) => day.slots.length === 0)).toBe(true)
  })

  it('marks the padding of a month grid out of period', () => {
    const { days } = calendarOf([], { ...week, view: 'month' })

    expect(days[0]).toMatchObject({
      date: '2026-02-23',
      inCurrentPeriod: false
    })
    expect(days[6]).toMatchObject({ date: '2026-03-01', inCurrentPeriod: true })
  })
})

describe('boxes', () => {
  it('places a timed event on the day it falls on', () => {
    const [box] = calendarOf([
      timed('a', '2026-03-18T09:00', '2026-03-18T10:30')
    ]).days[WEDNESDAY_INDEX].boxes

    expect(box).toMatchObject({
      startMinute: 540,
      endMinute: 630,
      minutes: 90,
      top: 0.375,
      height: 0.0625,
      left: 0,
      width: 1,
      column: 0,
      columns: 1,
      span: 1,
      continuesBefore: false,
      continuesAfter: false
    })
    expect(box.start).toBe('2026-03-18T09:00:00+02:00')
    expect(box.end).toBe('2026-03-18T10:30:00+02:00')
  })

  it('keeps the whole event on the box as a timed entry', () => {
    const [box] = calendarOf([
      timed('a', '2026-03-18T22:00', '2026-03-19T02:00')
    ]).days[WEDNESDAY_INDEX].boxes

    expect(box.event).toEqual({
      id: 'a',
      allDay: false,
      start: '2026-03-18T22:00:00+02:00',
      end: '2026-03-19T02:00:00+02:00',
      data: undefined
    })
  })

  it('splits an event crossing midnight into two boxes', () => {
    const { days } = calendarOf([
      timed('a', '2026-03-18T22:00', '2026-03-19T02:00')
    ])

    expect(days[WEDNESDAY_INDEX].boxes[0]).toMatchObject({
      startMinute: 1320,
      endMinute: MINUTES_IN_DAY,
      continuesBefore: false,
      continuesAfter: true
    })
    expect(days[THURSDAY_INDEX].boxes[0]).toMatchObject({
      startMinute: 0,
      endMinute: 120,
      continuesBefore: true,
      continuesAfter: false
    })
  })

  it('packs overlapping events into columns', () => {
    const { boxes } = calendarOf([
      timed('a', '2026-03-18T09:00', '2026-03-18T11:00'),
      timed('b', '2026-03-18T10:00', '2026-03-18T12:00')
    ]).days[WEDNESDAY_INDEX]

    expect(boxes.map((box) => box.event.id)).toEqual(['a', 'b'])
    expect(boxes.map((box) => box.left)).toEqual([0, HALF])
    expect(boxes.map((box) => box.width)).toEqual([HALF, HALF])
    expect(boxes.every((box) => box.columns === 2)).toBe(true)
  })
})

describe('bars', () => {
  it('draws an all-day event above the grid', () => {
    const [row] = calendarOf([
      { id: 'a', start: ANCHOR, end: '2026-03-20' }
    ]).rows

    expect(row).toMatchObject({
      start: '2026-03-16',
      end: '2026-03-23',
      dayCount: 7,
      lanes: 1
    })
    expect(row.bars[0]).toMatchObject({
      start: ANCHOR,
      end: '2026-03-20',
      startDay: WEDNESDAY_INDEX,
      endDay: 4,
      dayCount: 2,
      lane: 0,
      lanes: 1
    })
    expect(row.bars[0].event).toEqual({
      id: 'a',
      allDay: true,
      start: ANCHOR,
      end: '2026-03-20',
      data: undefined
    })
  })

  it('lifts a timed event that covers a whole day out of the grid', () => {
    const calendar = calendarOf([
      timed('a', '2026-03-18T09:00', '2026-03-19T09:00')
    ])

    expect(calendar.days.every((day) => day.boxes.length === 0)).toBe(true)
    expect(calendar.rows[0].bars[0].event).toMatchObject({
      allDay: false,
      start: '2026-03-18T09:00:00+02:00',
      end: '2026-03-19T09:00:00+02:00'
    })
    expect(calendar.rows[0].bars[0]).toMatchObject({ startDay: 2, dayCount: 2 })
  })

  it('cuts a month into week rows', () => {
    const { rows } = calendarOf([], { ...week, view: 'month' })

    expect(rows).toHaveLength(MONTH_GRID_ROWS)
    expect(rows.map((row) => row.start)).toEqual([
      '2026-02-23',
      '2026-03-02',
      '2026-03-09',
      '2026-03-16',
      '2026-03-23',
      '2026-03-30'
    ])
    expect(rows.every((row) => row.dayCount === 7)).toBe(true)
  })

  it('gives every other view a single row', () => {
    expect(calendarOf([], { ...week, view: 'agenda' }).rows).toHaveLength(1)
    expect(calendarOf([], { ...week, view: 'day' }).rows).toHaveLength(1)
  })
})

describe('the surface is plain JSON', () => {
  it('survives a JSON round trip', () => {
    const calendar = calendarOf(
      [
        timed('a', '2026-03-18T09:00', '2026-03-18T10:30'),
        timed('b', '2026-03-18T22:00', '2026-03-19T02:00'),
        { id: 'c', start: ANCHOR, end: '2026-03-20' }
      ],
      { ...week, view: 'month' }
    )

    expect(JSON.parse(JSON.stringify(calendar))).toEqual(calendar)
  })

  it('carries user data through', () => {
    const calendar = buildCalendar<{ title: string }>(week, [
      { id: 'a', start: '2026-03-18T09:00', data: { title: 'Standup' } },
      { id: 'b', start: ANCHOR, data: { title: 'Offsite' } }
    ])

    expect(calendar.days[WEDNESDAY_INDEX].boxes[0].event.data).toEqual({
      title: 'Standup'
    })
    expect(calendar.rows[0].bars[0].event.data).toEqual({ title: 'Offsite' })
  })
})

describe('invalid input', () => {
  it('throws on an event that cannot be read', () => {
    expect(() => calendarOf([{ id: 'a', start: 'yesterday' }])).toThrow(
      InvalidEventError
    )
  })

  it('throws on an anchor that cannot be read', () => {
    expect(() => calendarOf([], { ...week, currentDate: 'yesterday' })).toThrow(
      InvalidRangeError
    )
  })

  it('throws on a time zone that cannot be read', () => {
    expect(() => calendarOf([], { ...week, timeZone: 'Not/AZone' })).toThrow(
      InvalidRangeError
    )
  })

  it('names the zone before it reads any event', () => {
    expect(() =>
      calendarOf([{ id: 'a', start: 'yesterday' }], {
        ...week,
        timeZone: 'Not/AZone'
      })
    ).toThrow(InvalidRangeError)
  })
})
