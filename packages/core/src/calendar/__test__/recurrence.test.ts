import { describe, expect, it } from 'vitest'

import { InvalidRecurrenceError } from '#src/recurrence'
import type { EventInput } from '#src/event'
import type { CalendarRange } from '#src/range'

import { buildCalendar } from '../index'
import type { CalendarLayout } from '../types'

const KYIV = 'Europe/Kyiv'

const week: CalendarRange = { view: 'week', date: '2026-03-18', timeZone: KYIV }

const daily: EventInput = {
  id: 'stand-up',
  start: '2026-03-02T09:00:00',
  duration: 'PT30M',
  recurrence: { rule: 'FREQ=DAILY' }
}

const boxesOf = (
  calendar: CalendarLayout
): CalendarLayout['days'][number]['boxes'] =>
  calendar.days.flatMap((day) => day.boxes)

describe('a recurring event on the grid', () => {
  it('fills every day of the week', () => {
    const boxes = boxesOf(buildCalendar(week, [daily]))

    expect(boxes).toHaveLength(7)
    expect(boxes[0].start).toBe('2026-03-16T09:00:00+02:00')
    expect(boxes[6].start).toBe('2026-03-22T09:00:00+02:00')
  })

  it('names each box after its own instance', () => {
    const [box] = boxesOf(buildCalendar(week, [daily]))

    expect(box.event.id).toBe('stand-up__2026-03-16T09:00:00+02:00')
    expect(box.event.seriesId).toBe('stand-up')
    expect(box.event.recurrenceId).toBe('2026-03-16T09:00:00+02:00')
  })

  it('leaves a plain event without recurrence marks', () => {
    const [box] = boxesOf(
      buildCalendar(week, [
        { id: 'once', start: '2026-03-18T09:00:00', duration: 'PT30M' }
      ])
    )

    expect(box.event.id).toBe('once')
    expect(box.event.seriesId).toBeUndefined()
    expect(box.event.recurrenceId).toBeUndefined()
  })

  it.each([15, 30, 60])(
    'counts the same instances at %i minute slots',
    (slotMinutes) => {
      expect(
        boxesOf(buildCalendar({ ...week, slotMinutes }, [daily]))
      ).toHaveLength(7)
    }
  )

  it('drops the occurrences an exception removes', () => {
    const boxes = boxesOf(
      buildCalendar(week, [
        {
          ...daily,
          recurrence: {
            rule: 'FREQ=DAILY',
            exceptions: ['2026-03-18T09:00:00']
          }
        }
      ])
    )

    expect(boxes).toHaveLength(6)
  })

  it('lays an all-day series into the lanes', () => {
    const calendar = buildCalendar(week, [
      {
        id: 'sprint',
        start: '2026-03-02',
        end: '2026-03-04',
        recurrence: { rule: 'FREQ=WEEKLY' }
      }
    ])

    expect(calendar.rows[0].bars).toHaveLength(1)
    expect(calendar.rows[0].bars[0].start).toBe('2026-03-16')
    expect(calendar.rows[0].bars[0].end).toBe('2026-03-18')
  })

  it('packs overlapping instances into columns', () => {
    const boxes = boxesOf(
      buildCalendar({ ...week, view: 'day', date: '2026-03-18' }, [
        daily,
        { ...daily, id: 'review' }
      ])
    )

    expect(boxes).toHaveLength(2)
    expect(boxes.map((box) => box.columns)).toEqual([2, 2])
  })

  it('survives a JSON round trip', () => {
    const calendar = buildCalendar(week, [daily])

    expect(JSON.parse(JSON.stringify(calendar))).toEqual(calendar)
  })

  it('reports a broken rule as an invalid recurrence', () => {
    expect(() =>
      buildCalendar(week, [
        { ...daily, recurrence: { rule: 'FREQ=FORTNIGHTLY' } }
      ])
    ).toThrow(InvalidRecurrenceError)
  })
})
