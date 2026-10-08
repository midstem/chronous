import type { ChronousCalendarEvent } from '@/components/ui/chronous-calendar'

import { EVERY_OTHER_WEEK, SERIES_LEAD_DAYS, WEEKDAYS } from './constants'
import { mondayOf, shifted } from './helpers'

export const demoEvents = (anchor: string): ChronousCalendarEvent[] => {
  const week = mondayOf(anchor)
  const series = shifted(week, SERIES_LEAD_DAYS)
  const on = (offset: number, time: string): string =>
    `${shifted(series, offset)}T${time}`

  return [
    {
      id: 'standup',
      start: on(0, '09:30'),
      duration: 'PT15M',
      recurrence: { rule: WEEKDAYS },
      data: { title: 'Daily standup', color: 'chart-1' }
    },
    {
      id: 'run',
      start: on(0, '07:00'),
      duration: 'PT45M',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' },
      data: { title: 'Morning run', color: 'chart-4' }
    },
    {
      id: 'team-sync',
      start: on(0, '11:00'),
      duration: 'PT1H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=MO' },
      data: { title: 'Team sync' }
    },
    {
      id: 'planning',
      start: on(0, '14:00'),
      duration: 'PT90M',
      recurrence: { rule: `${EVERY_OTHER_WEEK};BYDAY=MO` },
      data: { title: 'Sprint planning', color: 'chart-3' }
    },
    {
      id: 'focus',
      start: on(1, '13:30'),
      duration: 'PT2H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=TU,TH' },
      data: { title: 'Focus time', color: 'chart-2' }
    },
    {
      id: 'yoga',
      start: on(1, '18:30'),
      duration: 'PT1H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=TU' },
      data: { title: 'Yoga', color: 'chart-4' }
    },
    {
      id: 'design-review',
      start: on(2, '15:00'),
      duration: 'PT1H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=WE' },
      data: { title: 'Design review', color: 'chart-3' }
    },
    {
      id: 'one-on-one',
      start: on(2, '15:30'),
      duration: 'PT30M',
      recurrence: { rule: `${EVERY_OTHER_WEEK};BYDAY=WE` },
      data: { title: '1:1 with manager', color: 'chart-5' }
    },
    {
      id: 'release',
      start: on(3, '20:00'),
      duration: 'PT1H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=TH' },
      data: { title: 'Release window', color: 'chart-5' }
    },
    {
      id: 'book-club',
      start: on(3, '19:00'),
      duration: 'PT90M',
      recurrence: { rule: 'FREQ=MONTHLY;BYDAY=-1TH' },
      data: { title: 'Book club', color: 'chart-1' }
    },
    {
      id: 'retro',
      start: on(4, '16:00'),
      duration: 'PT1H',
      recurrence: { rule: `${EVERY_OTHER_WEEK};BYDAY=FR` },
      data: { title: 'Sprint retro', color: 'chart-3' }
    },
    {
      id: 'hike',
      start: on(5, '10:00'),
      duration: 'PT3H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=SA' },
      data: { title: 'Weekend hike', color: 'chart-2' }
    },
    {
      id: 'dinner',
      start: on(6, '18:00'),
      duration: 'PT2H',
      recurrence: { rule: 'FREQ=WEEKLY;BYDAY=SU' },
      data: { title: 'Family dinner', color: 'chart-5' }
    },
    {
      id: 'payday',
      start: series,
      duration: 'P1D',
      allDay: true,
      recurrence: { rule: 'FREQ=MONTHLY;BYMONTHDAY=15' },
      data: { title: 'Payday', color: 'chart-2' }
    },
    {
      id: 'offsite',
      start: shifted(week, 3),
      duration: 'P2D',
      allDay: true,
      data: { title: 'Team offsite', color: 'chart-4' }
    },
    {
      id: 'conference',
      start: shifted(week, 8),
      duration: 'P3D',
      allDay: true,
      data: { title: 'Conference', color: 'chart-3' }
    }
  ]
}
