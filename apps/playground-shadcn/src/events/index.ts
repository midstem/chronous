import type { ChronousCalendarEvent } from '@/components/ui/chronous-calendar'

const shifted = (date: string, days: number): string => {
  const moment = new Date(`${date}T00:00:00Z`)
  moment.setUTCDate(moment.getUTCDate() + days)
  return moment.toISOString().slice(0, 10)
}

export const demoEvents = (anchor: string): ChronousCalendarEvent[] => [
  {
    id: 'standup',
    start: `${anchor}T09:00`,
    duration: 'PT30M',
    data: { title: 'Standup', color: 'chart-1' }
  },
  {
    id: 'review',
    start: `${anchor}T11:00`,
    duration: 'PT90M',
    data: { title: 'Design review', color: 'chart-3' }
  },
  {
    id: 'lunch',
    start: `${anchor}T13:00`,
    duration: 'PT1H',
    data: { title: 'Lunch' }
  },
  {
    id: 'one-on-one',
    start: `${anchor}T15:00`,
    duration: 'PT30M',
    data: { title: '1:1', color: 'chart-5' }
  },
  {
    id: 'offsite',
    start: anchor,
    duration: 'P2D',
    allDay: true,
    data: { title: 'Team offsite', color: 'chart-4' }
  },
  {
    id: 'planning',
    start: `${shifted(anchor, 1)}T10:00`,
    duration: 'PT1H',
    data: { title: 'Sprint planning', color: 'chart-2' }
  },
  {
    id: 'retro',
    start: `${shifted(anchor, -2)}T16:00`,
    duration: 'PT45M',
    data: { title: 'Retro', color: 'chart-3' }
  }
]
