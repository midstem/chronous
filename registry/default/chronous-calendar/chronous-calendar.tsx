'use client'

import 'temporal-polyfill/global'

import { useState } from 'react'
import type { ReactElement } from 'react'
import {
  createCalendarComponents,
  formatIso,
  useCalendarNavigation
} from '@midstem/chronous-react'
import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'
import { Button } from '@/components/ui/button'

type ChronousCalendarEvent = { title: string }

const Calendar = createCalendarComponents<ChronousCalendarEvent>()
const MONTH_YEAR = { month: 'long', year: 'numeric' } as const
const WEEK_DAY = { month: 'short', day: 'numeric' } as const
const EMPTY_EVENTS: readonly EventInput<ChronousCalendarEvent>[] = []
const EVENT_CLOCK = { hour: '2-digit', minute: '2-digit' } as const

export type ChronousCalendarProps = {
  events?: readonly EventInput<ChronousCalendarEvent>[]
  initialDate?: string
  timeZone?: string
  locale?: LocaleId
  scrollToHour?: number | null
}

const todayInTimeZone = (timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const part = (type: string): string =>
    parts.find((value) => value.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

const rangeOf = (currentDate: string, timeZone: string): CalendarRange => ({
  view: 'week',
  currentDate,
  timeZone
})

const dateLabel = (date: string, locale: LocaleId): string =>
  formatIso(date, { locale, options: WEEK_DAY })

const clockLabel = (minuteOfDay: number): string => {
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

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

export function ChronousCalendar({
  events = EMPTY_EVENTS,
  initialDate,
  timeZone = 'Europe/Kyiv',
  locale = 'en-US',
  scrollToHour = 8
}: ChronousCalendarProps): ReactElement {
  const [range, setRange] = useState(() =>
    rangeOf(initialDate ?? todayInTimeZone(timeZone), timeZone)
  )
  const visibleRange = { ...range, timeZone }
  const navigation = useCalendarNavigation(visibleRange)
  const today = todayInTimeZone(timeZone)

  const goTo = (nextRange: CalendarRange | null): void => {
    if (nextRange) setRange(nextRange)
  }

  return (
    <section
      aria-label="Weekly schedule"
      className="w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <Calendar.Root
        range={visibleRange}
        events={events}
        locale={locale}
        gutterWidth="4.5rem"
      >
        {({ calendar }) => {
          const firstDay = calendar.days[0]?.date ?? range.currentDate
          const lastDay = calendar.days.at(-1)?.date ?? range.currentDate
          const weekLabel = `${dateLabel(firstDay, locale)} – ${dateLabel(lastDay, locale)}`

          return (
            <>
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
                <div aria-live="polite" aria-atomic="true" className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {formatIso(range.currentDate, {
                      locale,
                      options: MONTH_YEAR
                    })}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    <span>{weekLabel}</span>
                    <span aria-hidden="true" className="text-border">
                      ·
                    </span>
                    <span>{timeZone}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="inline-flex items-center rounded-md border border-input">
                    <Button
                      aria-label="Previous week"
                      className="rounded-r-none"
                      disabled={!navigation.prev}
                      onClick={() => goTo(navigation.prev)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Chevron direction="left" />
                    </Button>
                    <span
                      aria-hidden="true"
                      className="h-5 border-l border-border"
                    />
                    <Button
                      aria-label="Next week"
                      className="rounded-l-none"
                      disabled={!navigation.next}
                      onClick={() => goTo(navigation.next)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Chevron direction="right" />
                    </Button>
                  </div>
                  <Button
                    disabled={!navigation.today}
                    onClick={() => goTo(navigation.today?.() ?? null)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Today
                  </Button>
                </div>
              </header>

              <div
                aria-label="Calendar days"
                className="overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                role="region"
                tabIndex={0}
              >
                <div className="min-w-[720px]">
                  <Calendar.Header className="bg-card">
                    <Calendar.DayHeadings className="border-b border-border px-2 py-3 text-center text-xs font-medium text-muted-foreground">
                      {({ date, weekdayLabel, dayLabel }) => (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="uppercase tracking-wide">
                            {weekdayLabel}
                          </span>
                          <span
                            className={
                              date === today
                                ? 'grid size-8 place-items-center rounded-full bg-primary font-semibold text-primary-foreground'
                                : 'grid size-8 place-items-center rounded-full font-medium text-foreground'
                            }
                          >
                            {dayLabel}
                          </span>
                        </div>
                      )}
                    </Calendar.DayHeadings>
                  </Calendar.Header>

                  <Calendar.AllDayRow
                    className="border-b border-border bg-muted/20"
                    gutterCell={
                      <span className="block px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        All day
                      </span>
                    }
                    laneHeight={32}
                    minLanes={1}
                  >
                    <Calendar.AllDayEvents className="truncate rounded-md bg-primary/10 px-2 text-xs font-medium leading-8 text-primary">
                      {({ event }) => event.data?.title ?? event.id}
                    </Calendar.AllDayEvents>
                  </Calendar.AllDayRow>

                  <Calendar.TimeGrid
                    aria-label="Calendar times"
                    className="h-[min(60vh,560px)] min-h-[320px] py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    hourHeight={64}
                    role="region"
                    scrollToHour={scrollToHour}
                    tabIndex={0}
                  >
                    <Calendar.TimeAxis className="bg-muted/10">
                      <Calendar.TimeLabels className="right-2 z-10 text-[10px] tabular-nums text-muted-foreground">
                        {({ minuteOfDay }) => (
                          <span>{clockLabel(minuteOfDay)}</span>
                        )}
                      </Calendar.TimeLabels>
                    </Calendar.TimeAxis>
                    <Calendar.DayColumns className="border-l border-border/70">
                      <Calendar.TimeSlots className="border-t border-border/60" />
                      <Calendar.TimedEvents className="rounded-md border-l-2 border-primary bg-primary/10 px-2 py-1 text-xs text-foreground shadow-sm">
                        {({ event, box }) => (
                          <div className="flex h-full min-w-0 flex-col justify-center overflow-hidden">
                            <span className="truncate font-medium">
                              {event.data?.title ?? event.id}
                            </span>
                            {box.minutes >= 45 && (
                              <span className="truncate text-[10px] leading-tight text-muted-foreground">
                                {formatIso(box.start, {
                                  locale,
                                  options: EVENT_CLOCK
                                })}
                                {' – '}
                                {formatIso(box.end, {
                                  locale,
                                  options: EVENT_CLOCK
                                })}
                              </span>
                            )}
                          </div>
                        )}
                      </Calendar.TimedEvents>
                    </Calendar.DayColumns>
                  </Calendar.TimeGrid>
                </div>
              </div>
            </>
          )
        }}
      </Calendar.Root>
    </section>
  )
}
