import { describe, expect, it } from 'vitest'

import { buildCalendar } from '../index'

describe('recurrence in the event time zone', () => {
  it('applies a calendar-day duration in the event zone before display', () => {
    const calendar = buildCalendar(
      {
        view: 'days',
        currentDate: '2026-03-07',
        dayCount: 2,
        timeZone: 'Europe/Berlin'
      },
      [
        {
          id: 'overnight',
          start: '2026-03-07T09:00:00',
          duration: 'P1D',
          timeZone: 'America/New_York'
        }
      ]
    )

    expect(calendar.days[0].boxes[0].event).toMatchObject({
      start: '2026-03-07T15:00:00+01:00',
      end: '2026-03-08T14:00:00+01:00'
    })
  })

  it('keeps New York at 09:00 when a Berlin calendar crosses the US DST change', () => {
    const calendar = buildCalendar(
      {
        view: 'days',
        currentDate: '2026-03-02',
        dayCount: 16,
        timeZone: 'Europe/Berlin'
      },
      [
        {
          id: 'team',
          start: '2026-03-02T09:00:00',
          duration: 'PT1H',
          timeZone: 'America/New_York',
          recurrence: { rule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=3' }
        }
      ]
    )

    const boxes = calendar.days.flatMap((day) => day.boxes)
    expect(boxes.map((box) => box.start)).toEqual([
      '2026-03-02T15:00:00+01:00',
      '2026-03-09T14:00:00+01:00',
      '2026-03-16T14:00:00+01:00'
    ])
    expect(boxes.map((box) => box.event.recurrenceId)).toEqual([
      '2026-03-02T09:00:00-05:00',
      '2026-03-09T09:00:00-04:00',
      '2026-03-16T09:00:00-04:00'
    ])
  })

  it('matches a local exception and moves an override in the series zone', () => {
    const calendar = buildCalendar(
      {
        view: 'days',
        currentDate: '2026-03-02',
        dayCount: 16,
        timeZone: 'Europe/Berlin'
      },
      [
        {
          id: 'team',
          start: '2026-03-02T09:00:00',
          duration: 'PT1H',
          timeZone: 'America/New_York',
          recurrence: {
            rule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=3',
            exceptions: ['2026-03-09T09:00:00'],
            overrides: [
              {
                recurrenceId: '2026-03-16T09:00:00',
                start: '2026-03-16T11:00:00'
              }
            ]
          }
        }
      ]
    )

    expect(
      calendar.days.flatMap((day) => day.boxes.map((box) => box.start))
    ).toEqual(['2026-03-02T15:00:00+01:00', '2026-03-16T16:00:00+01:00'])
  })

  it('finds an event whose source date differs from the viewer date', () => {
    const calendar = buildCalendar(
      {
        view: 'day',
        currentDate: '2026-07-07',
        timeZone: 'Asia/Tokyo'
      },
      [
        {
          id: 'late',
          start: '2026-07-05T23:30:00',
          timeZone: 'America/New_York',
          recurrence: { rule: 'FREQ=DAILY;COUNT=2' }
        }
      ]
    )

    expect(calendar.days[0].boxes.map((box) => box.start)).toEqual([
      '2026-07-07T12:30:00+09:00'
    ])
  })
})
