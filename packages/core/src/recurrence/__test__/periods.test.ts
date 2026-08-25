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

describe('monthly rules', () => {
  it('takes the last Friday of each month', () => {
    expect(
      expand(
        recurring('FREQ=MONTHLY;BYDAY=-1FR;COUNT=3', '2026-01-01T09:00:00'),
        '2026-01-01',
        '2026-05-01'
      )
    ).toEqual([
      '2026-01-30T09:00:00+02:00',
      '2026-02-27T09:00:00+02:00',
      '2026-03-27T09:00:00+02:00'
    ])
  })

  it('skips months without the requested day', () => {
    expect(
      expand(
        recurring('FREQ=MONTHLY;BYMONTHDAY=31;COUNT=3', '2026-01-31T09:00:00'),
        '2026-01-01',
        '2026-07-01'
      )
    ).toEqual([
      '2026-01-31T09:00:00+02:00',
      '2026-03-31T09:00:00+03:00',
      '2026-05-31T09:00:00+03:00'
    ])
  })

  it('skips a month too short for the anchor day', () => {
    expect(
      expand(
        recurring('FREQ=MONTHLY;COUNT=3', '2026-01-31T09:00:00'),
        '2026-01-01',
        '2026-07-01'
      )
    ).toEqual([
      '2026-01-31T09:00:00+02:00',
      '2026-03-31T09:00:00+03:00',
      '2026-05-31T09:00:00+03:00'
    ])
  })

  it('takes the last weekday of each month through BYSETPOS', () => {
    expect(
      expand(
        recurring(
          'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1;COUNT=3',
          '2026-01-01T09:00:00'
        ),
        '2026-01-01',
        '2026-05-01'
      )
    ).toEqual([
      '2026-01-30T09:00:00+02:00',
      '2026-02-27T09:00:00+02:00',
      '2026-03-31T09:00:00+03:00'
    ])
  })
})

describe('rules that skip whole periods', () => {
  it('finds a fifth Friday only where a month has one', () => {
    expect(
      expand(
        recurring('FREQ=MONTHLY;BYDAY=5FR;COUNT=3', '2026-01-01T09:00:00'),
        '2026-01-01',
        '2026-09-01'
      )
    ).toEqual([
      '2026-01-30T09:00:00+02:00',
      '2026-05-29T09:00:00+03:00',
      '2026-07-31T09:00:00+03:00'
    ])
  })

  it('limits a daily rule to one month of the year', () => {
    expect(
      expand(
        recurring('FREQ=DAILY;BYMONTH=6;COUNT=2', '2026-01-15T09:00:00'),
        '2026-01-01',
        '2026-09-01'
      )
    ).toEqual(['2026-06-01T09:00:00+03:00', '2026-06-02T09:00:00+03:00'])
  })

  it('limits a weekly rule to one month of the year', () => {
    expect(
      expand(
        recurring(
          'FREQ=WEEKLY;BYDAY=MO;BYMONTH=6;COUNT=2',
          '2026-01-05T09:00:00'
        ),
        '2026-01-01',
        '2026-09-01'
      )
    ).toEqual(['2026-06-01T09:00:00+03:00', '2026-06-08T09:00:00+03:00'])
  })

  it('crosses the years a BYDAY narrows away', () => {
    expect(
      expand(
        recurring(
          'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1,2,3;BYDAY=MO;COUNT=2',
          '2026-01-01T09:00:00'
        ),
        '2026-01-01',
        '2030-01-01'
      )
    ).toEqual(['2028-01-03T09:00:00+02:00', '2029-01-01T09:00:00+02:00'])
  })

  it('counts a BYMONTHDAY back from the end of the month', () => {
    expect(
      expand(
        recurring(
          'FREQ=MONTHLY;BYMONTHDAY=-1,-31;COUNT=3',
          '2026-01-01T09:00:00'
        ),
        '2026-01-01',
        '2026-05-01'
      )
    ).toEqual([
      '2026-01-01T09:00:00+02:00',
      '2026-01-31T09:00:00+02:00',
      '2026-02-28T09:00:00+02:00'
    ])
  })

  it('limits a monthly rule to one month of the year', () => {
    expect(
      expand(
        recurring('FREQ=MONTHLY;BYMONTH=6;COUNT=2', '2026-01-15T09:00:00'),
        '2026-01-01',
        '2028-01-01'
      )
    ).toEqual(['2026-06-15T09:00:00+03:00', '2027-06-15T09:00:00+03:00'])
  })

  it('waits for the leap year a yearly anchor needs', () => {
    expect(
      expand(
        recurring('FREQ=YEARLY;BYMONTH=2;COUNT=1', '2026-01-29T09:00:00'),
        '2026-01-01',
        '2029-01-01'
      )
    ).toEqual(['2028-02-29T09:00:00+02:00'])
  })

  it('gives up on a BYSETPOS no period reaches', () => {
    expect(
      expand(
        recurring('FREQ=MONTHLY;BYDAY=MO;BYSETPOS=6', '2026-01-01T09:00:00'),
        '2026-01-01',
        '2027-01-01'
      )
    ).toEqual([])
  })
})

describe('yearly rules', () => {
  it('takes the second Sunday of a named month', () => {
    expect(
      expand(
        recurring(
          'FREQ=YEARLY;BYMONTH=3;BYDAY=2SU;COUNT=2',
          '2026-01-01T09:00:00'
        ),
        '2026-01-01',
        '2028-01-01'
      )
    ).toEqual(['2026-03-08T09:00:00+02:00', '2027-03-14T09:00:00+02:00'])
  })

  it('takes a named month and day', () => {
    expect(
      expand(
        recurring(
          'FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=4;COUNT=2',
          '2026-01-01T09:00:00'
        ),
        '2026-01-01',
        '2028-01-01'
      )
    ).toEqual(['2026-07-04T09:00:00+03:00', '2027-07-04T09:00:00+03:00'])
  })

  it('counts an ordinal weekday across the whole year', () => {
    expect(
      expand(
        recurring('FREQ=YEARLY;BYDAY=-1SU;COUNT=2', '2026-01-01T09:00:00'),
        '2026-01-01',
        '2028-01-01'
      )
    ).toEqual(['2026-12-27T09:00:00+02:00', '2027-12-26T09:00:00+02:00'])
  })

  it('repeats the anchor day when no BY parts are given', () => {
    expect(
      expand(
        recurring('FREQ=YEARLY;COUNT=2', '2026-05-10T09:00:00'),
        '2026-01-01',
        '2028-01-01'
      )
    ).toEqual(['2026-05-10T09:00:00+03:00', '2027-05-10T09:00:00+03:00'])
  })
})
