export const INSTALL_COMMAND =
  'npx shadcn@latest add https://midstem.github.io/chronous/r/chronous-calendar.json'

export const DEPENDENCIES_COMMAND =
  'npm install @midstem/chronous-react temporal-polyfill class-variance-authority lucide-react'

export const BUTTON_COMMAND = 'npx shadcn@latest add button'

export const COMPONENT_PATH = 'components/ui/chronous-calendar.tsx'

export const USAGE = `import {
  ChronousCalendar,
  type ChronousCalendarEvent
} from '@/components/ui/chronous-calendar'

const events: ChronousCalendarEvent[] = [
  {
    id: 'standup',
    start: '2026-03-16T09:30',
    duration: 'PT15M',
    recurrence: { rule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    data: { title: 'Daily standup', color: 'chart-1' }
  },
  {
    id: 'offsite',
    start: '2026-03-19',
    duration: 'P2D',
    allDay: true,
    data: { title: 'Team offsite', color: 'chart-4' }
  }
]

export function Schedule() {
  return <ChronousCalendar events={events} defaultView="week" />
}
`
