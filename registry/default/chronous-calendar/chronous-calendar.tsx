'use client'

import 'temporal-polyfill/global'

import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import {
  createCalendarComponents,
  formatIso,
  useCalendarNavigation
} from '@midstem/chronous-react'
import type {
  CalendarRange,
  EventInput,
  LocaleId,
  ViewKind
} from '@midstem/chronous-react'
import { Button } from '@/components/ui/button'

export type ChronousCalendarEventColor =
  'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

type ChronousCalendarEvent = {
  title: string
  color?: ChronousCalendarEventColor
}

const Calendar = createCalendarComponents<ChronousCalendarEvent>()
const MONTH_YEAR = { month: 'long', year: 'numeric' } as const
const WEEK_DAY = { month: 'short', day: 'numeric' } as const
const EVENT_CLOCK = { hour: '2-digit', minute: '2-digit' } as const
const EMPTY_EVENTS: readonly EventInput<ChronousCalendarEvent>[] = []
const VIEWS: { id: 'week' | 'month' | 'agenda'; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'agenda', label: 'Agenda' }
]

export type ChronousCalendarProps = {
  events?: readonly EventInput<ChronousCalendarEvent>[]
  initialDate?: string
  initialView?: 'week' | 'month' | 'agenda'
  timeZone?: string
  locale?: LocaleId
  scrollToHour?: number | null
  className?: string
}

export type ChronousCalendarEventData = ChronousCalendarEvent

const EVENT_TONES: Record<ChronousCalendarEventColor, string> = {
  'chart-1': 'bg-chart-1/10 border-chart-1/25 border-l-2 border-l-chart-1',
  'chart-2': 'bg-chart-2/10 border-chart-2/25 border-l-2 border-l-chart-2',
  'chart-3': 'bg-chart-3/10 border-chart-3/25 border-l-2 border-l-chart-3',
  'chart-4': 'bg-chart-4/10 border-chart-4/25 border-l-2 border-l-chart-4',
  'chart-5': 'bg-chart-5/10 border-chart-5/25 border-l-2 border-l-chart-5'
}

const eventTone = (color: ChronousCalendarEventColor = 'chart-2'): string =>
  EVENT_TONES[color]

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

const rangeOf = (
  currentDate: string,
  timeZone: string,
  view: ViewKind
): CalendarRange => ({ view, currentDate, timeZone })

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

const periodLabel = (
  calendar: { days: { date: string; inCurrentPeriod: boolean }[] },
  range: CalendarRange,
  locale: LocaleId
): string => {
  if (range.view === 'month') {
    const dates = calendar.days
      .filter((day) => day.inCurrentPeriod)
      .map((day) => day.date)
    const first = dates[0] ?? range.currentDate
    const last = dates.at(-1) ?? range.currentDate
    return `${dateLabel(first, locale)} – ${dateLabel(last, locale)}`
  }

  const first = calendar.days[0]?.date ?? range.currentDate
  const last = calendar.days.at(-1)?.date ?? range.currentDate
  return `${dateLabel(first, locale)} – ${dateLabel(last, locale)}`
}

type EventPillProps = {
  color?: ChronousCalendarEventColor
  title: string
  time?: string
  size: 'week' | 'month'
}

const EventPill = ({
  color,
  title,
  time,
  size
}: EventPillProps): ReactElement => (
  <span
    className={`${
      size === 'week'
        ? 'inline-flex h-6 w-full items-center gap-2 truncate rounded border px-2 text-foreground'
        : 'flex h-[22px] w-full items-center gap-1.5 truncate rounded border px-1.5 text-[10px] text-foreground'
    } ${eventTone(color)}`}
  >
    {time && (
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {time}
      </span>
    )}
    <span className="truncate">{title}</span>
  </span>
)

type EventCardProps = {
  color?: ChronousCalendarEventColor
  title: string
  time?: string
  size: 'week' | 'agenda'
}

const EventCard = ({
  color,
  title,
  time,
  size
}: EventCardProps): ReactElement => (
  <div
    className={`${
      size === 'week'
        ? 'flex h-full w-full min-w-0 flex-col items-start justify-start overflow-hidden rounded-md border px-2 py-1 text-foreground'
        : 'flex min-w-0 flex-col items-start rounded-lg border px-3 py-2 text-foreground'
    } ${eventTone(color)}`}
  >
    <p
      className={`truncate font-medium ${size === 'week' ? 'text-xs' : 'text-sm'}`}
    >
      {title}
    </p>
    {time && (
      <p
        className={`truncate text-muted-foreground ${size === 'week' ? 'text-[10px] leading-tight' : 'text-xs'}`}
      >
        {time}
      </p>
    )}
  </div>
)

const Marker = (): ReactElement => (
  <>
    <span className="absolute -left-1.5 top-0 size-3 -translate-y-1/2 rounded-full border-2 border-background bg-red-500" />
    <span className="absolute left-0 right-0 top-0 h-px bg-red-500" />
  </>
)

const MonthContents = ({
  locale,
  today
}: {
  locale: LocaleId
  today: string
}): ReactElement => (
  <Calendar.MonthGrid className="min-w-[720px]">
    <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20">
      <Calendar.MonthWeekdays className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {({ weekdayLabel }) => weekdayLabel}
      </Calendar.MonthWeekdays>
    </div>
    <Calendar.MonthRows
      className="grid auto-rows-[minmax(112px,auto)] grid-cols-7"
      laneHeight={24}
      maxLanes={2}
    >
      <Calendar.MonthDays className="relative min-h-[112px] border-b border-r border-border/60 p-2 last:border-r-0 data-[in-current-period=false]:bg-muted/15">
        {({ day, dayLabel, boxes, hiddenBars, inCurrentPeriod, lanes }) => {
          const extraEvents = Math.max(0, boxes.length - 2) + hiddenBars.length

          return (
            <>
              <div className="absolute left-2 right-2 top-2 flex h-7 items-center">
                <span
                  className={
                    day.date === today
                      ? 'grid size-7 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'
                      : `text-sm font-medium ${inCurrentPeriod ? 'text-foreground' : 'text-muted-foreground'}`
                  }
                >
                  {dayLabel}
                </span>
              </div>
              <div
                className="flex flex-col gap-1"
                style={{ marginTop: 32 + lanes * 24 }}
              >
                {boxes.slice(0, 2).map((box) => (
                  <EventPill
                    key={`${box.event.id}-${box.startMinute}`}
                    color={box.event.data?.color}
                    size="month"
                    time={formatIso(box.start, {
                      locale,
                      options: EVENT_CLOCK
                    })}
                    title={box.event.data?.title ?? box.event.id}
                  />
                ))}
                {extraEvents > 0 && (
                  <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
                    +{extraEvents} more
                  </span>
                )}
              </div>
            </>
          )
        }}
      </Calendar.MonthDays>
      <Calendar.MonthAllDayEvents
        className="truncate text-[10px] font-medium"
        lanesTopOffset={40}
      >
        {({ event }) => (
          <EventPill
            color={event.data?.color}
            size="month"
            title={event.data?.title ?? event.id}
          />
        )}
      </Calendar.MonthAllDayEvents>
    </Calendar.MonthRows>
  </Calendar.MonthGrid>
)

const AgendaContents = ({
  hasEvents
}: {
  hasEvents: boolean
}): ReactElement => {
  if (!hasEvents) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No events in this period
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Events for this date range will appear here.
        </p>
      </div>
    )
  }

  return (
    <Calendar.AgendaList className="divide-y divide-border/60">
      <Calendar.AgendaDays
        className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5 sm:px-6"
        showEmptyDays={false}
      >
        {({ weekdayLabel, dayLabel, monthLabel }) => (
          <>
            <div className="pt-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {weekdayLabel}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {dayLabel}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {monthLabel}
                </span>
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Calendar.AgendaAllDayEvents>
                {({ event }) => (
                  <EventCard
                    color={event.data?.color}
                    size="agenda"
                    time="All day"
                    title={event.data?.title ?? event.id}
                  />
                )}
              </Calendar.AgendaAllDayEvents>
              <Calendar.AgendaTimedEvents>
                {({ event, timeRangeLabel }) => (
                  <EventCard
                    color={event.data?.color}
                    size="agenda"
                    time={timeRangeLabel}
                    title={event.data?.title ?? event.id}
                  />
                )}
              </Calendar.AgendaTimedEvents>
            </div>
          </>
        )}
      </Calendar.AgendaDays>
    </Calendar.AgendaList>
  )
}

export function ChronousCalendar({
  events = EMPTY_EVENTS,
  initialDate,
  initialView = 'week',
  timeZone: requestedTimeZone,
  locale = 'en-US',
  scrollToHour = 8,
  className = ''
}: ChronousCalendarProps): ReactElement {
  const initialSettings = useRef({
    hasInitialDate: initialDate !== undefined,
    hasExplicitTimeZone: requestedTimeZone !== undefined
  })
  const [localTimeZone, setLocalTimeZone] = useState<string | null>(null)
  const [range, setRange] = useState(() =>
    rangeOf(
      initialDate ?? todayInTimeZone(requestedTimeZone ?? 'UTC'),
      requestedTimeZone ?? 'UTC',
      initialView
    )
  )
  const timeZone = requestedTimeZone ?? localTimeZone ?? 'UTC'
  const visibleRange = { ...range, timeZone }
  const navigation = useCalendarNavigation(visibleRange)
  const today = todayInTimeZone(timeZone)

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    setLocalTimeZone(detected)

    if (!initialSettings.current.hasExplicitTimeZone) {
      setRange((current) => ({
        ...current,
        currentDate: initialSettings.current.hasInitialDate
          ? current.currentDate
          : todayInTimeZone(detected),
        timeZone: detected
      }))
    }
  }, [])

  const goTo = (nextRange: CalendarRange | null): void => {
    if (nextRange) setRange(nextRange)
  }
  const goToView = (view: 'week' | 'month' | 'agenda'): void => {
    setRange(navigation.withView(view))
  }

  return (
    <section
      aria-label="Calendar"
      className={`[color-scheme:light] dark:[color-scheme:dark] w-full max-w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground ${className}`.trim()}
    >
      <Calendar.Root
        range={visibleRange}
        events={events}
        locale={locale}
        gutterWidth="4.5rem"
      >
        {({ calendar }) => {
          const caption = periodLabel(calendar, visibleRange, locale)
          const monthTitle = formatIso(visibleRange.currentDate, {
            locale,
            options: MONTH_YEAR
          })
          const hasEvents =
            calendar.days.some((day) => day.boxes.length > 0) ||
            calendar.rows.some((row) => row.bars.length > 0)

          return (
            <>
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <h2
                    aria-live="polite"
                    className="text-xl font-semibold tracking-tight"
                  >
                    {monthTitle}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {caption}
                  </p>
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
                        aria-pressed={visibleRange.view === id}
                        className="h-8 px-2.5 text-xs sm:px-3"
                        onClick={() => goToView(id)}
                        size="sm"
                        type="button"
                        variant={visibleRange.view === id ? 'default' : 'ghost'}
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
                      onClick={() => goTo(navigation.prev)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Chevron direction="left" />
                    </Button>
                    <span
                      aria-hidden="true"
                      className="h-5 border-l border-border/70"
                    />
                    <Button
                      aria-label="Next period"
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

              {visibleRange.view === 'week' ? (
                <div
                  aria-label="Calendar days"
                  className="overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  role="region"
                  tabIndex={0}
                >
                  <div className="min-w-[720px]">
                    <Calendar.Header className="border-b border-border/60 bg-card">
                      <Calendar.DayHeadings className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {({ date, weekdayLabel, dayLabel }) => (
                          <div className="flex flex-col items-center gap-1.5">
                            <span>{weekdayLabel}</span>
                            <span
                              className={
                                date === today
                                  ? 'grid size-9 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground'
                                  : 'grid size-9 place-items-center rounded-full text-lg font-medium text-foreground'
                              }
                            >
                              {dayLabel}
                            </span>
                          </div>
                        )}
                      </Calendar.DayHeadings>
                    </Calendar.Header>

                    <Calendar.AllDayRow
                      className="border-b border-border/70 bg-muted/20"
                      gutterCell={
                        <span className="flex h-8 items-center justify-end pr-2 text-[10px] text-muted-foreground">
                          All day
                        </span>
                      }
                      laneHeight={32}
                      minLanes={1}
                    >
                      <Calendar.AllDayEvents className="flex items-center truncate text-xs font-medium">
                        {({ event }) => (
                          <EventPill
                            color={event.data?.color}
                            size="week"
                            title={event.data?.title ?? event.id}
                          />
                        )}
                      </Calendar.AllDayEvents>
                    </Calendar.AllDayRow>

                    <Calendar.TimeGrid
                      aria-label="Calendar times"
                      className="h-[min(60vh,560px)] min-h-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      hourHeight={64}
                      role="region"
                      scrollToHour={
                        scrollToHour === null
                          ? null
                          : Math.max(0, scrollToHour - 0.125)
                      }
                      tabIndex={0}
                    >
                      <Calendar.TimeAxis className="bg-muted/10">
                        <Calendar.TimeLabels className="right-2 z-10 text-[10px] tabular-nums text-muted-foreground">
                          {({ minuteOfDay }) =>
                            minuteOfDay === 0 ? null : clockLabel(minuteOfDay)
                          }
                        </Calendar.TimeLabels>
                      </Calendar.TimeAxis>
                      <Calendar.DayColumns className="border-l border-border/60">
                        <Calendar.TimeSlots className="border-t border-border/50" />
                        <Calendar.TimedEvents
                          className="pl-1 text-xs"
                          minHeight={28}
                        >
                          {({ event, box }) => (
                            <EventCard
                              color={event.data?.color}
                              size="week"
                              time={
                                box.minutes >= 45
                                  ? `${formatIso(box.start, { locale, options: EVENT_CLOCK })} – ${formatIso(box.end, { locale, options: EVENT_CLOCK })}`
                                  : undefined
                              }
                              title={event.data?.title ?? event.id}
                            />
                          )}
                        </Calendar.TimedEvents>
                        <Calendar.NowMarker className="pointer-events-none">
                          <Marker />
                        </Calendar.NowMarker>
                      </Calendar.DayColumns>
                    </Calendar.TimeGrid>
                  </div>
                </div>
              ) : visibleRange.view === 'month' ? (
                <div
                  aria-label="Calendar month"
                  className="overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  role="region"
                  tabIndex={0}
                >
                  <MonthContents locale={locale} today={today} />
                </div>
              ) : (
                <div
                  aria-label="Calendar agenda"
                  className="max-h-[min(70vh,680px)] overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  role="region"
                  tabIndex={0}
                >
                  <AgendaContents hasEvents={hasEvents} />
                </div>
              )}
            </>
          )
        }}
      </Calendar.Root>
    </section>
  )
}
