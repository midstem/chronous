import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput, NormalizeContext } from '#src/event'
import { toIso, zoned } from '#src/time'

import { expandEvents } from '../index'

const KYIV = 'Europe/Kyiv'

const expand = (
  input: EventInput,
  from: string,
  to: string,
  timeZone: string = KYIV
): string[] => {
  const context: NormalizeContext = { timeZone }
  const window = { start: zoned(from, timeZone), end: zoned(to, timeZone) }

  return expandEvents(normalizeEvents([input], context), window, context).map(
    (event) => toIso(event.start)
  )
}

const recurring = (
  rule: string,
  start = '2026-05-10T09:00:00'
): EventInput => ({
  id: 'a',
  start,
  duration: 'PT1H',
  recurrence: { rule }
})

describe('plain events', () => {
  it('passes an event without a rule through untouched', () => {
    const context: NormalizeContext = { timeZone: KYIV }
    const window = {
      start: zoned('2026-05-01', KYIV),
      end: zoned('2026-06-01', KYIV)
    }
    const events = expandEvents(
      normalizeEvents([{ id: 'a', start: '2026-05-10T09:00:00' }], context),
      window,
      context
    )

    expect(events).toHaveLength(1)
    expect(events[0].id).toBe('a')
    expect(events[0].recurrenceId).toBeUndefined()
  })
})

describe('daily rules', () => {
  it('repeats a bounded number of times', () => {
    expect(
      expand(recurring('FREQ=DAILY;COUNT=3'), '2026-05-01', '2026-06-01')
    ).toEqual([
      '2026-05-10T09:00:00+03:00',
      '2026-05-11T09:00:00+03:00',
      '2026-05-12T09:00:00+03:00'
    ])
  })

  it('honours an interval', () => {
    expect(
      expand(
        recurring('FREQ=DAILY;INTERVAL=3;COUNT=3'),
        '2026-05-01',
        '2026-06-01'
      )
    ).toEqual([
      '2026-05-10T09:00:00+03:00',
      '2026-05-13T09:00:00+03:00',
      '2026-05-16T09:00:00+03:00'
    ])
  })

  it('stops at a date UNTIL', () => {
    expect(
      expand(recurring('FREQ=DAILY;UNTIL=20260512'), '2026-05-01', '2026-06-01')
    ).toEqual([
      '2026-05-10T09:00:00+03:00',
      '2026-05-11T09:00:00+03:00',
      '2026-05-12T09:00:00+03:00'
    ])
  })

  it('stops at an instant UNTIL inside a day', () => {
    expect(
      expand(
        recurring('FREQ=DAILY;UNTIL=20260512T050000Z'),
        '2026-05-01',
        '2026-06-01'
      )
    ).toEqual(['2026-05-10T09:00:00+03:00', '2026-05-11T09:00:00+03:00'])
  })

  it('keeps only the days a BYMONTHDAY names', () => {
    expect(
      expand(
        recurring('FREQ=DAILY;BYMONTHDAY=1,-1;COUNT=4', '2026-01-15T09:00:00'),
        '2026-01-01',
        '2026-04-01'
      )
    ).toEqual([
      '2026-01-31T09:00:00+02:00',
      '2026-02-01T09:00:00+02:00',
      '2026-02-28T09:00:00+02:00',
      '2026-03-01T09:00:00+02:00'
    ])
  })

  it('accepts an RRULE prefix', () => {
    expect(
      expand(recurring('RRULE:FREQ=DAILY;COUNT=2'), '2026-05-01', '2026-06-01')
    ).toHaveLength(2)
  })
})

describe('weekly rules', () => {
  it('expands the listed weekdays', () => {
    expect(
      expand(
        recurring('FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4', '2026-05-11T09:00:00'),
        '2026-05-01',
        '2026-06-01'
      )
    ).toEqual([
      '2026-05-11T09:00:00+03:00',
      '2026-05-13T09:00:00+03:00',
      '2026-05-18T09:00:00+03:00',
      '2026-05-20T09:00:00+03:00'
    ])
  })

  it('skips an anchor the rule does not match', () => {
    expect(
      expand(
        recurring('FREQ=WEEKLY;BYDAY=MO;COUNT=2', '2026-05-12T09:00:00'),
        '2026-05-01',
        '2026-06-01'
      )
    ).toEqual(['2026-05-18T09:00:00+03:00', '2026-05-25T09:00:00+03:00'])
  })

  it('anchors an interval on a Monday week start', () => {
    expect(
      expand(
        recurring(
          'FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO',
          '1997-08-05T09:00:00'
        ),
        '1997-08-01',
        '1997-09-10'
      )
    ).toEqual([
      '1997-08-05T09:00:00+03:00',
      '1997-08-10T09:00:00+03:00',
      '1997-08-19T09:00:00+03:00',
      '1997-08-24T09:00:00+03:00'
    ])
  })

  it('anchors an interval on a Sunday week start', () => {
    expect(
      expand(
        recurring(
          'FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU',
          '1997-08-05T09:00:00'
        ),
        '1997-08-01',
        '1997-09-10'
      )
    ).toEqual([
      '1997-08-05T09:00:00+03:00',
      '1997-08-17T09:00:00+03:00',
      '1997-08-19T09:00:00+03:00',
      '1997-08-31T09:00:00+03:00'
    ])
  })
})

describe('the window', () => {
  it('drops instances that end before it starts', () => {
    expect(
      expand(recurring('FREQ=DAILY;COUNT=10'), '2026-05-15', '2026-05-17')
    ).toEqual(['2026-05-15T09:00:00+03:00', '2026-05-16T09:00:00+03:00'])
  })

  it('keeps an instance that started before it', () => {
    expect(
      expand(
        {
          id: 'a',
          start: '2026-05-10T22:00:00',
          duration: 'PT4H',
          recurrence: { rule: 'FREQ=DAILY;COUNT=10' }
        },
        '2026-05-15',
        '2026-05-16'
      )
    ).toEqual(['2026-05-14T22:00:00+03:00', '2026-05-15T22:00:00+03:00'])
  })

  it('never expands an unbounded rule beyond the window', () => {
    expect(
      expand(recurring('FREQ=DAILY'), '2026-05-10', '2026-05-13')
    ).toHaveLength(3)
  })
})
