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

describe('instance identity', () => {
  it('names an instance after its series and its recurrence id', () => {
    const [first] = expand(
      daily({ rule: 'FREQ=DAILY;COUNT=2' }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(first.id).toBe('a__2026-05-10T09:00:00+03:00')
    expect(first.seriesId).toBe('a')
    expect(first.recurrenceId).toBe('2026-05-10T09:00:00+03:00')
  })

  it('carries the series data onto every instance', () => {
    const instances = expand(
      { ...daily({ rule: 'FREQ=DAILY;COUNT=2' }), data: { title: 'stand-up' } },
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => event.data)).toEqual([
      { title: 'stand-up' },
      { title: 'stand-up' }
    ])
  })

  it('keeps the recurrence rule off the instances', () => {
    const [first] = expand(
      daily({ rule: 'FREQ=DAILY;COUNT=2' }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(first.recurrence).toBeUndefined()
  })

  it('repeats the length of the series', () => {
    const instances = expand(
      daily({ rule: 'FREQ=DAILY;COUNT=2' }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map(bounds)).toEqual([
      ['2026-05-10T09:00:00+03:00', '2026-05-10T10:00:00+03:00'],
      ['2026-05-11T09:00:00+03:00', '2026-05-11T10:00:00+03:00']
    ])
  })
})

describe('exceptions', () => {
  it('removes the named occurrence', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=3',
        exceptions: ['2026-05-11T09:00:00']
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-10T09:00:00+03:00',
      '2026-05-12T09:00:00+03:00'
    ])
  })

  it('matches an exception written in another zone', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=3',
        exceptions: ['2026-05-11T06:00:00Z']
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances).toHaveLength(2)
  })

  it('leaves COUNT untouched', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=3',
        exceptions: ['2026-05-10T09:00:00', '2026-05-11T09:00:00']
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances).toHaveLength(1)
  })

  it('ignores an exception that names no occurrence', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=2',
        exceptions: ['2026-07-01T09:00:00']
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances).toHaveLength(2)
  })
})

describe('overrides', () => {
  it('cancels a single occurrence', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=3',
        overrides: [{ recurrenceId: '2026-05-11T09:00:00', cancelled: true }]
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-10T09:00:00+03:00',
      '2026-05-12T09:00:00+03:00'
    ])
  })

  it('moves an occurrence and keeps its length', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=2',
        overrides: [
          { recurrenceId: '2026-05-11T09:00:00', start: '2026-05-11T14:00:00' }
        ]
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(bounds(instances[1])).toEqual([
      '2026-05-11T14:00:00+03:00',
      '2026-05-11T15:00:00+03:00'
    ])
  })

  it('takes an explicit end from the override', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=2',
        overrides: [
          {
            recurrenceId: '2026-05-11T09:00:00',
            start: '2026-05-11T14:00:00',
            end: '2026-05-11T16:30:00'
          }
        ]
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(bounds(instances[1])).toEqual([
      '2026-05-11T14:00:00+03:00',
      '2026-05-11T16:30:00+03:00'
    ])
  })

  it('keeps the recurrence id of the occupied slot', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=2',
        overrides: [
          { recurrenceId: '2026-05-11T09:00:00', start: '2026-05-11T14:00:00' }
        ]
      }),
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances[1].recurrenceId).toBe('2026-05-11T09:00:00+03:00')
  })

  it('replaces the data of one occurrence', () => {
    const instances = expand(
      {
        ...daily({
          rule: 'FREQ=DAILY;COUNT=2',
          overrides: [
            { recurrenceId: '2026-05-11T09:00:00', data: { title: 'moved' } }
          ]
        }),
        data: { title: 'stand-up' }
      },
      '2026-05-01',
      '2026-06-01'
    )

    expect(instances.map((event) => event.data)).toEqual([
      { title: 'stand-up' },
      { title: 'moved' }
    ])
  })

  it('pulls an occurrence into the window from outside it', () => {
    const instances = expand(
      daily({
        rule: 'FREQ=DAILY;COUNT=2',
        overrides: [
          { recurrenceId: '2026-05-11T09:00:00', start: '2026-05-20T09:00:00' }
        ]
      }),
      '2026-05-19',
      '2026-05-21'
    )

    expect(instances.map((event) => toIso(event.start))).toEqual([
      '2026-05-20T09:00:00+03:00'
    ])
  })
})
