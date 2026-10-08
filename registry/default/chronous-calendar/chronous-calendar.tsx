'use client'

import 'temporal-polyfill/global'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import {
  createCalendarComponents,
  formatIso,
  useCalendarContext,
  useNow,
  type CalendarRange,
  type EventInput,
  type LocaleId,
  type ViewKind
} from '@midstem/chronous-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ChronousCalendarView = Extract<
  ViewKind,
  'day' | 'week' | 'month' | 'agenda'
>

type ChronousCalendarEventColor =
  'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

type ChronousCalendarEventData = {
  title: string
  color?: ChronousCalendarEventColor
}

type ChronousCalendarEvent = EventInput<ChronousCalendarEventData>

type ChronousCalendarProps = Omit<
  React.ComponentProps<'section'>,
  'children'
> & {
  events?: readonly ChronousCalendarEvent[]
  defaultDate?: string
  defaultView?: ChronousCalendarView
  timeZone?: string
  locale?: LocaleId
  scrollToHour?: number | null
}

const Calendar = createCalendarComponents<ChronousCalendarEventData>()

const VIEWS: { value: ChronousCalendarView; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'agenda', label: 'Agenda' }
]

const NO_EVENTS: readonly ChronousCalendarEvent[] = []
const MONTH_YEAR = { month: 'long', year: 'numeric' } as const
const SHORT_DATE = { month: 'short', day: 'numeric' } as const
const CLOCK = { hour: '2-digit', minute: '2-digit' } as const
const MONTH_VISIBLE_EVENTS = 2

const calendarEventVariants = cva(
  'flex w-full min-w-0 overflow-hidden rounded-md border border-l-2 text-foreground',
  {
    variants: {
      color: {
        'chart-1': 'border-chart-1/25 border-l-chart-1 bg-chart-1/10',
        'chart-2': 'border-chart-2/25 border-l-chart-2 bg-chart-2/10',
        'chart-3': 'border-chart-3/25 border-l-chart-3 bg-chart-3/10',
        'chart-4': 'border-chart-4/25 border-l-chart-4 bg-chart-4/10',
        'chart-5': 'border-chart-5/25 border-l-chart-5 bg-chart-5/10'
      },
      size: {
        sm: 'h-[22px] items-center gap-1.5 px-1.5 text-[10px]',
        default: 'h-6 items-center gap-2 px-2 text-xs',
        block: 'h-full flex-col px-2 py-1 text-xs',
        lg: 'flex-col rounded-lg px-3 py-2 text-sm'
      }
    },
    defaultVariants: {
      color: 'chart-2',
      size: 'default'
    }
  }
)

function CalendarEvent({
  className,
  color,
  size,
  title,
  time,
  ...props
}: Omit<React.ComponentProps<'div'>, 'color' | 'title'> &
  VariantProps<typeof calendarEventVariants> & {
    title: string
    time?: string
  }) {
  const stacked = size === 'block' || size === 'lg'

  return (
    <div
      data-slot="calendar-event"
      className={cn(calendarEventVariants({ color, size }), className)}
      {...props}
    >
      <span className={cn('truncate', stacked && 'font-medium')}>{title}</span>
      {time && (
        <span
          className={cn(
            'shrink-0 truncate tabular-nums text-muted-foreground',
            !stacked && 'order-first'
          )}
        >
          {time}
        </span>
      )}
    </div>
  )
}

function eventProps(event: { id: string; data?: ChronousCalendarEventData }) {
  return { title: event.data?.title ?? event.id, color: event.data?.color }
}

function CalendarScrollArea({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      role="region"
      tabIndex={0}
      className={cn(
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
        className
      )}
      {...props}
    />
  )
}

function CalendarToolbar({
  locale,
  onNavigate
}: {
  locale: LocaleId
  onNavigate: (range: CalendarRange) => void
}) {
  const { calendar } = useCalendarContext()
  const first = calendar.days[0]?.date
  const last = calendar.days.at(-1)?.date

  return (
    <Calendar.Toolbar
      data-slot="calendar-toolbar"
      className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-4 sm:px-6"
      onNavigate={onNavigate}
    >
      {({ navigation, range, goTo }) => (
        <>
          <div className="min-w-0">
            <h2
              aria-live="polite"
              className="text-xl font-semibold tracking-tight"
            >
              {formatIso(range.currentDate, { locale, options: MONTH_YEAR })}
            </h2>
            {range.view !== 'month' && first && last && (
              <p className="text-muted-foreground mt-1 text-sm">
                {first === last
                  ? formatIso(first, { locale, options: SHORT_DATE })
                  : `${formatIso(first, { locale, options: SHORT_DATE })} – ${formatIso(last, { locale, options: SHORT_DATE })}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Calendar view"
              className="bg-muted/30 inline-flex items-center rounded-md border p-0.5"
            >
              {VIEWS.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={range.view === value ? 'default' : 'ghost'}
                  aria-pressed={range.view === value}
                  className="h-8 px-2.5 text-xs sm:px-3"
                  onClick={() => goTo(navigation.withView(value))}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="inline-flex items-center rounded-md border">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Previous period"
                className="rounded-r-none"
                disabled={!navigation.prev}
                onClick={() => navigation.prev && goTo(navigation.prev)}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Next period"
                className="rounded-l-none border-l"
                disabled={!navigation.next}
                onClick={() => navigation.next && goTo(navigation.next)}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!navigation.today}
              onClick={() => navigation.today && goTo(navigation.today())}
            >
              Today
            </Button>
          </div>
        </>
      )}
    </Calendar.Toolbar>
  )
}

function CalendarTimeGridView({
  view,
  locale,
  today,
  scrollToHour
}: {
  view: ChronousCalendarView
  locale: LocaleId
  today?: string
  scrollToHour: number | null
}) {
  return (
    <CalendarScrollArea
      aria-label="Calendar days"
      className="overflow-x-auto overscroll-x-contain"
    >
      <div className={cn(view === 'week' && 'min-w-[720px]')}>
        <Calendar.Header className="bg-card border-b">
          <Calendar.DayHeadings className="text-muted-foreground px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wide">
            {({ date, weekdayLabel, dayLabel }) => (
              <div className="flex flex-col items-center gap-1.5">
                <span>{weekdayLabel}</span>
                <span
                  data-today={date === today}
                  className="text-foreground data-[today=true]:bg-primary data-[today=true]:text-primary-foreground grid size-9 place-items-center rounded-full text-lg font-medium data-[today=true]:font-semibold"
                >
                  {dayLabel}
                </span>
              </div>
            )}
          </Calendar.DayHeadings>
        </Calendar.Header>
        <Calendar.AllDayRow
          className="bg-muted/20 border-b"
          laneHeight={32}
          minLanes={1}
          gutterCell={
            <span className="text-muted-foreground flex h-8 items-center justify-end pr-2 text-[10px]">
              All day
            </span>
          }
        >
          <Calendar.AllDayEvents className="flex items-center font-medium">
            {({ event }) => <CalendarEvent {...eventProps(event)} />}
          </Calendar.AllDayEvents>
        </Calendar.AllDayRow>
        <Calendar.TimeGrid
          role="region"
          tabIndex={0}
          aria-label="Calendar times"
          className="focus-visible:ring-ring h-[min(60vh,560px)] min-h-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          hourHeight={64}
          scrollToHour={
            scrollToHour === null ? null : Math.max(0, scrollToHour - 0.125)
          }
        >
          <Calendar.TimeAxis className="bg-muted/10">
            <Calendar.TimeLabels className="text-muted-foreground right-2 z-10 text-[10px] tabular-nums">
              {({ minuteOfDay, timeLabel }) =>
                minuteOfDay === 0 ? null : timeLabel
              }
            </Calendar.TimeLabels>
          </Calendar.TimeAxis>
          <Calendar.DayColumns className="border-l">
            <Calendar.TimeSlots className="border-t" />
            <Calendar.TimedEvents className="pl-1" minHeight={28}>
              {({ event, box }) => (
                <CalendarEvent
                  size="block"
                  time={
                    box.minutes >= 45
                      ? `${formatIso(box.start, { locale, options: CLOCK })} – ${formatIso(box.end, { locale, options: CLOCK })}`
                      : undefined
                  }
                  {...eventProps(event)}
                />
              )}
            </Calendar.TimedEvents>
            <Calendar.NowMarker className="pointer-events-none">
              <span className="border-background bg-destructive absolute -left-1.5 top-0 size-3 -translate-y-1/2 rounded-full border-2" />
              <span className="bg-destructive absolute inset-x-0 top-0 h-px" />
            </Calendar.NowMarker>
          </Calendar.DayColumns>
        </Calendar.TimeGrid>
      </div>
    </CalendarScrollArea>
  )
}

function CalendarMonthView({
  locale,
  today
}: {
  locale: LocaleId
  today?: string
}) {
  return (
    <CalendarScrollArea
      aria-label="Calendar month"
      className="overflow-x-auto overscroll-x-contain"
    >
      <Calendar.MonthGrid className="min-w-[720px]">
        <div className="bg-muted/20 grid grid-cols-7 border-b">
          <Calendar.MonthWeekdays className="text-muted-foreground px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wide">
            {({ weekdayLabel }) => weekdayLabel}
          </Calendar.MonthWeekdays>
        </div>
        <Calendar.MonthRows
          className="grid auto-rows-[minmax(112px,auto)] grid-cols-7"
          laneHeight={24}
          maxLanes={MONTH_VISIBLE_EVENTS}
        >
          <Calendar.MonthDays className="data-[in-current-period=false]:bg-muted/15 relative min-h-[112px] border-b border-r p-2 last:border-r-0">
            {({ day, dayLabel, boxes, hiddenBars, inCurrentPeriod, lanes }) => {
              const hidden =
                Math.max(0, boxes.length - MONTH_VISIBLE_EVENTS) +
                hiddenBars.length

              return (
                <>
                  <span
                    data-today={day.date === today}
                    className={cn(
                      'absolute left-2 top-2 grid size-7 place-items-center rounded-full text-sm font-medium',
                      inCurrentPeriod
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                      'data-[today=true]:bg-primary data-[today=true]:text-primary-foreground data-[today=true]:font-semibold'
                    )}
                  >
                    {dayLabel}
                  </span>
                  <div
                    className="flex flex-col gap-1"
                    style={{ marginTop: 32 + lanes * 24 }}
                  >
                    {boxes.slice(0, MONTH_VISIBLE_EVENTS).map((box) => (
                      <CalendarEvent
                        key={`${box.event.id}-${box.startMinute}`}
                        size="sm"
                        time={formatIso(box.start, { locale, options: CLOCK })}
                        {...eventProps(box.event)}
                      />
                    ))}
                    {hidden > 0 && (
                      <span className="text-muted-foreground px-1.5 text-[10px] font-medium">
                        +{hidden} more
                      </span>
                    )}
                  </div>
                </>
              )
            }}
          </Calendar.MonthDays>
          <Calendar.MonthAllDayEvents
            className="px-1.5 font-medium"
            lanesTopOffset={40}
          >
            {({ event }) => <CalendarEvent size="sm" {...eventProps(event)} />}
          </Calendar.MonthAllDayEvents>
        </Calendar.MonthRows>
      </Calendar.MonthGrid>
    </CalendarScrollArea>
  )
}

function CalendarAgendaView() {
  const { calendar } = useCalendarContext()
  const isEmpty =
    calendar.days.every((day) => day.boxes.length === 0) &&
    calendar.rows.every((row) => row.bars.length === 0)

  return (
    <CalendarScrollArea
      aria-label="Calendar agenda"
      className="max-h-[min(70vh,680px)] overflow-y-auto"
    >
      {isEmpty ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium">No events in this period</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Events for this date range will appear here.
          </p>
        </div>
      ) : (
        <Calendar.AgendaList className="divide-y">
          <Calendar.AgendaDays
            className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5 sm:px-6"
            showEmptyDays={false}
          >
            {({ weekdayLabel, dayLabel, monthLabel }) => (
              <>
                <div className="pt-1">
                  <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                    {weekdayLabel}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight">
                    {dayLabel}
                    <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                      {monthLabel}
                    </span>
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <Calendar.AgendaAllDayEvents>
                    {({ event }) => (
                      <CalendarEvent
                        size="lg"
                        time="All day"
                        {...eventProps(event)}
                      />
                    )}
                  </Calendar.AgendaAllDayEvents>
                  <Calendar.AgendaTimedEvents>
                    {({ event, timeRangeLabel }) => (
                      <CalendarEvent
                        size="lg"
                        time={timeRangeLabel}
                        {...eventProps(event)}
                      />
                    )}
                  </Calendar.AgendaTimedEvents>
                </div>
              </>
            )}
          </Calendar.AgendaDays>
        </Calendar.AgendaList>
      )}
    </CalendarScrollArea>
  )
}

const subscribeToTimeZone = () => () => {}

function useLocalTimeZone() {
  return React.useSyncExternalStore(
    subscribeToTimeZone,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => 'UTC'
  )
}

function ChronousCalendar({
  events = NO_EVENTS,
  defaultDate,
  defaultView = 'week',
  timeZone,
  locale = 'en-US',
  scrollToHour = 8,
  className,
  ...props
}: ChronousCalendarProps) {
  const localTimeZone = useLocalTimeZone()
  const zone = timeZone ?? localTimeZone
  const now = useNow(zone)
  const [position, setPosition] = React.useState({
    view: defaultView as ViewKind,
    currentDate: defaultDate
  })
  const range: CalendarRange = {
    view: position.view,
    timeZone: zone,
    currentDate:
      position.currentDate ?? now?.date ?? new Date().toISOString().slice(0, 10)
  }

  return (
    <section
      data-slot="chronous-calendar"
      aria-label="Calendar"
      className={cn(
        'bg-card text-card-foreground w-full max-w-full overflow-hidden rounded-xl border',
        className
      )}
      {...props}
    >
      <Calendar.Root
        range={range}
        events={events}
        locale={locale}
        gutterWidth="4.5rem"
      >
        <CalendarToolbar
          locale={locale}
          onNavigate={({ view, currentDate }) =>
            setPosition({ view, currentDate })
          }
        />
        {range.view === 'month' ? (
          <CalendarMonthView locale={locale} today={now?.date} />
        ) : range.view === 'agenda' ? (
          <CalendarAgendaView />
        ) : (
          <CalendarTimeGridView
            view={range.view as ChronousCalendarView}
            locale={locale}
            today={now?.date}
            scrollToHour={scrollToHour}
          />
        )}
      </Calendar.Root>
    </section>
  )
}

export {
  ChronousCalendar,
  CalendarEvent,
  calendarEventVariants,
  type ChronousCalendarEvent,
  type ChronousCalendarEventColor,
  type ChronousCalendarEventData,
  type ChronousCalendarProps,
  type ChronousCalendarView
}
