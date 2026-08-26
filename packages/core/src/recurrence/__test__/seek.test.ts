import { describe, expect, it } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { EventInput, NormalizeContext } from '#src/event'
import { toIso, zoned } from '#src/time'

import { expandEvents } from '../index'

const KYIV = 'Europe/Kyiv'

const expand = (input: EventInput, from: string, to: string): string[] => {
  const context: NormalizeContext = { timeZone: KYIV }
  const window = { start: zoned(from, KYIV), end: zoned(to, KYIV) }

  return expandEvents(normalizeEvents([input], context), window, context).map(
    (event) => toIso(event.start)
  )
}

const series = (
  rule: string,
  start: string,
  duration = 'PT1H'
): EventInput => ({
  id: 'a',
  start,
  duration,
  recurrence: { rule }
})

describe('a series anchored years before the window', () => {
  it('keeps a weekly interval on its cycle', () => {
    expect(
      expand(
        series('FREQ=WEEKLY;INTERVAL=3;BYDAY=MO', '2010-01-04T09:00:00'),
        '2026-03-16',
        '2026-04-06'
      )
    ).toEqual(['2026-03-23T09:00:00+02:00'])
  })

  it('keeps a monthly interval on its cycle', () => {
    expect(
      expand(
        series('FREQ=MONTHLY;INTERVAL=5', '2010-01-15T09:00:00'),
        '2026-03-01',
        '2026-05-01'
      )
    ).toEqual(['2026-04-15T09:00:00+03:00'])
  })

  it('keeps a yearly interval on its cycle', () => {
    expect(
      expand(
        series('FREQ=YEARLY;INTERVAL=4', '2010-03-23T09:00:00'),
        '2026-03-01',
        '2026-04-01'
      )
    ).toEqual(['2026-03-23T09:00:00+02:00'])
  })

  it('yields nothing in a year the interval steps over', () => {
    expect(
      expand(
        series('FREQ=YEARLY;INTERVAL=5', '2010-03-23T09:00:00'),
        '2026-03-01',
        '2026-04-01'
      )
    ).toEqual([])
  })

  it('keeps an instance that starts before the window and runs into it', () => {
    expect(
      expand(
        series('FREQ=WEEKLY;BYDAY=SA', '2010-01-02T20:00:00', 'P3D'),
        '2026-03-23',
        '2026-03-30'
      )
    ).toEqual(['2026-03-21T20:00:00+02:00', '2026-03-28T20:00:00+02:00'])
  })

  it('has spent a COUNT long before the window', () => {
    expect(
      expand(
        series('FREQ=DAILY;COUNT=5', '2010-01-01T09:00:00'),
        '2026-03-23',
        '2026-03-30'
      )
    ).toEqual([])
  })

  it('still counts a COUNT from the anchor', () => {
    const instances = expand(
      series('FREQ=DAILY;COUNT=30', '2026-03-01T09:00:00'),
      '2026-03-23',
      '2026-03-30'
    )

    expect(instances).toHaveLength(7)
    expect(instances[instances.length - 1]).toBe('2026-03-29T09:00:00+03:00')
  })
})
