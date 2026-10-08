import type { ReactElement } from 'react'
import {
  formatIso,
  type CalendarLayout,
  type CalendarNavigation,
  type CalendarRange,
  type LocaleId
} from '@midstem/chronous-react'
import { Button } from '@/components/ui/button'
import {
  MONTH_YEAR,
  periodLabel,
  type ChronousCalendarEventData,
  type ChronousCalendarView
} from './calendar'

const VIEWS: { id: ChronousCalendarView; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'agenda', label: 'Agenda' }
]

const Chevron = ({
  direction
}: {
  direction: 'left' | 'right'
}): ReactElement => (
  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
    <path
      d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
)

export const CalendarToolbar = ({
  calendar,
  range,
  locale,
  navigation,
  onNavigate,
  onView
}: {
  calendar: CalendarLayout<ChronousCalendarEventData>
  range: CalendarRange
  locale: LocaleId
  navigation: CalendarNavigation
  onNavigate: (range: CalendarRange | null) => void
  onView: (view: ChronousCalendarView) => void
}): ReactElement => {
  const caption = periodLabel(calendar, range, locale)
  const monthTitle = formatIso(range.currentDate, {
    locale,
    options: MONTH_YEAR
  })

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
      <div className="min-w-0">
        <h2 aria-live="polite" className="text-xl font-semibold tracking-tight">
          {monthTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div
          aria-label="Calendar view"
          className="inline-flex items-center rounded-md border border-border bg-muted/30 p-0.5"
          role="group"
        >
          {VIEWS.map(({ id, label }) => (
            <Button
              key={id}
              aria-pressed={range.view === id}
              className="h-8 px-2.5 text-xs sm:px-3"
              onClick={() => onView(id)}
              size="sm"
              type="button"
              variant={range.view === id ? 'default' : 'ghost'}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="inline-flex items-center rounded-md border border-border">
          <Button
            aria-label="Previous period"
            className="rounded-r-none"
            disabled={!navigation.prev}
            onClick={() => onNavigate(navigation.prev)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Chevron direction="left" />
          </Button>
          <span aria-hidden="true" className="h-5 border-l border-border/70" />
          <Button
            aria-label="Next period"
            className="rounded-l-none"
            disabled={!navigation.next}
            onClick={() => onNavigate(navigation.next)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Chevron direction="right" />
          </Button>
        </div>
        <Button
          disabled={!navigation.today}
          onClick={() => onNavigate(navigation.today?.() ?? null)}
          size="sm"
          type="button"
          variant="outline"
        >
          Today
        </Button>
      </div>
    </header>
  )
}
