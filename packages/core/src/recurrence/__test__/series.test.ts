import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { CalendarEvent, EventInput, NormalizeContext } from '#src/event'
import { toIso, zoned } from '#src/time'

import { expandEvents } from '../index'

const KYIV = 'Europe/Kyiv'

const expand = (
  input: EventInput,
  from: string,
  to: string
): CalendarEvent[] => {
  const context: NormalizeContext = { timeZone: KYIV }
  const window = { start: zoned(from, KYIV), end: zoned(to, KYIV) }

  return expandEvents(normalizeEvents([input], context), window, context)
}

const bounds = (event: CalendarEvent): string[] => [
  toIso(event.start),
  toIso(event.end)
]

const daily = (recurrence: EventInput['recurrence']): EventInput => ({
  id: 'a',
  start: '2026-05-10T09:00:00',
  duration: 'PT1H',
  recurrence
})

describe('occurrences outside the window', () => {
  it('leaves out an explicit date beyond it', () => {
    const instances = expand(
      daily({ rule: 'FREQ=DAILY;COUNT=2', dates: ['2026-07-20T11:00:00'] }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances).toHaveLength(2)
  })

  it('loses an occurrence an override pushes beyond it', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=2',
        overrides: [
          { recurrenceId: '2026-05-11T09:00:00', start: '2026-07-20T09:00:00' }
        ]
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-10T09:00:00+03:00'
    ])
  })
})

describe('explicit dates', () => {
  it('adds a date outside the rule', () => {
    const instances = expand(
      daily({ rule: 'FREQ=DAILY;COUNT=2', dates: ['2026-05-20T11:00:00'] }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map(bounds)).toEqual([
      ['2026-05-10T09:00:00+03:00', '2026-05-10T10:00:00+03:00'],
      ['2026-05-11T09:00:00+03:00', '2026-05-11T10:00:00+03:00'],
      ['2026-05-20T11:00:00+03:00', '2026-05-20T12:00:00+03:00']
    ])
  })

  it('stands alone without a rule', () => {
    const instances = expand(
      daily({ dates: ['2026-05-20T11:00:00'] }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-20T11:00:00+03:00'
    ])
  })
})

describe('all-day series', () => {
  it('repeats a two-day span every week', () => {
    const instances = expand(
      {
        id: 'a',
        start: '2026-05-11',
        end: '2026-05-13',
        recurrence: { rule: 'FREQ=WEEKLY;COUNT=2' }
      },
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map(bounds)).toEqual([
      ['2026-05-11', '2026-05-13'],
      ['2026-05-18', '2026-05-20']
    ])
  })

  it('stops an all-day series at an instant UNTIL', () => {
    const instances = expand(
      {
        id: 'a',
        start: '2026-05-11',
        recurrence: { rule: 'FREQ=DAILY;UNTIL=20260513T000000Z' }
      },
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-11',
      '2026-05-12',
      '2026-05-13'
    ])
  })

  it('reads an all-day exception written as an instant', () => {
    const instances = expand(
      {
        id: 'a',
        start: '2026-05-11',
        recurrence: {
          rule: 'FREQ=DAILY;COUNT=3',
          exceptions: ['2026-05-12T00:00:00Z']
        }
      },
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-11',
      '2026-05-13'
    ])
  })

  it('keys an all-day exception by date', () => {
    const instances = expand(
      {
        id: 'a',
        start: '2026-05-11',
        recurrence: {
          rule: 'FREQ=DAILY;COUNT=3',
          exceptions: ['2026-05-12']
        }
      },
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-11',
      '2026-05-13'
    ])
  })
})
