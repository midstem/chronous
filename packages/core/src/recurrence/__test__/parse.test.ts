import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput, NormalizeContext } from '#src/event'
import { zoned } from '#src/time'

import { InvalidRecurrenceError, expandEvents, parseRule } from '../index'

const KYIV = 'Europe/Kyiv'

const expand = (input: EventInput): unknown[] => {
  const context: NormalizeContext = { timeZone: KYIV }
  const window = {
    start: zoned('2026-01-01', KYIV),
    end: zoned('2027-01-01', KYIV)
  }

  return expandEvents(normalizeEvents([input], context), window, context)
}

const rejects = (rule: string): void => {
  expect(() => parseRule('a', rule)).toThrow(InvalidRecurrenceError)
}

describe('a parsed rule', () => {
  it('fills the defaults', () => {
    expect(parseRule('a', 'FREQ=DAILY')).toEqual({
      frequency: 'DAILY',
      interval: 1,
      count: undefined,
      until: undefined,
      byDay: [],
      byMonthDay: [],
      byMonth: [],
      bySetPos: [],
      weekStartsOn: 1
    })
  })

  it('reads every supported part', () => {
    expect(
      parseRule(
        'a',
        'FREQ=MONTHLY;INTERVAL=2;BYDAY=-1FR,MO;BYMONTHDAY=1,-1;BYMONTH=3;BYSETPOS=-1;WKST=SU'
      )
    ).toEqual({
      frequency: 'MONTHLY',
      interval: 2,
      count: undefined,
      until: undefined,
      byDay: [{ weekday: 'FR', ordinal: -1 }, { weekday: 'MO' }],
      byMonthDay: [1, -1],
      byMonth: [3],
      bySetPos: [-1],
      weekStartsOn: 0
    })
  })

  it('accepts lower case and an RRULE prefix', () => {
    expect(parseRule('a', 'rrule:freq=weekly;byday=mo').frequency).toBe(
      'WEEKLY'
    )
  })

  it('expands a compact UNTIL into an ISO string', () => {
    expect(parseRule('a', 'FREQ=DAILY;UNTIL=20260512T050000Z').until).toBe(
      '2026-05-12T05:00:00Z'
    )
  })

  it('expands a compact date UNTIL', () => {
    expect(parseRule('a', 'FREQ=DAILY;UNTIL=20260512').until).toBe('2026-05-12')
  })
})

describe('a rejected rule', () => {
  it('names the event and the reason', () => {
    expect(() => parseRule('stand-up', 'FREQ=HOURLY')).toThrow(
      'Recurrence of event "stand-up" has a malformed FREQ value "HOURLY".'
    )
  })

  it('refuses an empty rule', () => {
    rejects('')
  })

  it('refuses a rule without FREQ', () => {
    rejects('COUNT=3')
  })

  it('refuses an unsupported part', () => {
    rejects('FREQ=YEARLY;BYYEARDAY=1')
  })

  it('refuses COUNT together with UNTIL', () => {
    rejects('FREQ=DAILY;COUNT=2;UNTIL=20260512')
  })

  it('refuses a non-positive INTERVAL', () => {
    rejects('FREQ=DAILY;INTERVAL=0')
  })

  it('refuses a non-positive COUNT', () => {
    rejects('FREQ=DAILY;COUNT=0')
  })

  it('refuses a month outside the year', () => {
    rejects('FREQ=YEARLY;BYMONTH=13')
  })

  it('refuses a zero BYMONTHDAY', () => {
    rejects('FREQ=MONTHLY;BYMONTHDAY=0')
  })

  it('refuses a BYMONTHDAY beyond a month', () => {
    rejects('FREQ=MONTHLY;BYMONTHDAY=32')
  })

  it('refuses a malformed BYDAY', () => {
    rejects('FREQ=WEEKLY;BYDAY=XX')
  })

  it('refuses a zero BYDAY ordinal', () => {
    rejects('FREQ=MONTHLY;BYDAY=0MO')
  })

  it('refuses a BYDAY ordinal outside a monthly or yearly rule', () => {
    rejects('FREQ=WEEKLY;BYDAY=1MO')
  })

  it('refuses BYMONTHDAY inside a weekly rule', () => {
    rejects('FREQ=WEEKLY;BYMONTHDAY=1')
  })

  it('refuses a part without a value', () => {
    rejects('FREQ=DAILY;JUNK')
  })

  it('refuses a malformed WKST', () => {
    rejects('FREQ=WEEKLY;WKST=XX')
  })

  it('refuses a non-numeric INTERVAL', () => {
    rejects('FREQ=DAILY;INTERVAL=two')
  })
})

describe('a rule that cannot be satisfied', () => {
  it('yields nothing rather than running away', () => {
    expect(
      expand({
        id: 'a',
        start: '2026-01-01T09:00:00',
        recurrence: { rule: 'FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30' }
      })
    ).toEqual([])
  })

  it('reports an unreadable UNTIL', () => {
    expect(() =>
      expand({
        id: 'a',
        start: '2026-01-01T09:00:00',
        recurrence: { rule: 'FREQ=DAILY;UNTIL=whenever' }
      })
    ).toThrow(InvalidRecurrenceError)
  })

  it('reports an unreadable exception date', () => {
    expect(() =>
      expand({
        id: 'a',
        start: '2026-01-01T09:00:00',
        recurrence: {
          rule: 'FREQ=DAILY;COUNT=2',
          exceptions: ['not-a-date']
        }
      })
    ).toThrow(InvalidRecurrenceError)
  })
})
