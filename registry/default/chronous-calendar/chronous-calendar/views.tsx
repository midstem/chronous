import type { ReactElement } from 'react'
import { formatIso } from '@midstem/chronous-react'
import type { LocaleId, ViewKind } from '@midstem/chronous-react'
import { Calendar, EVENT_CLOCK, clockLabel } from './calendar'
import { EventCard, EventPill, NowMarker } from './events'

const MonthView = ({
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

const AgendaView = ({ hasEvents }: { hasEvents: boolean }): ReactElement => {
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

export const CalendarView = ({
  view,
  locale,
  today,
  scrollToHour,
  hasEvents
}: {
  view: ViewKind
  locale: LocaleId
  today: string
  scrollToHour: number | null
  hasEvents: boolean
}): ReactElement => {
  if (view === 'month') {
    return (
      <div
        aria-label="Calendar month"
        className="overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        role="region"
        tabIndex={0}
      >
        <MonthView locale={locale} today={today} />
      </div>
    )
  }

  if (view === 'agenda') {
    return (
      <div
        aria-label="Calendar agenda"
        className="max-h-[min(70vh,680px)] overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        role="region"
        tabIndex={0}
      >
        <AgendaView hasEvents={hasEvents} />
      </div>
    )
  }

  return (
    <div
      aria-label="Calendar days"
      className="overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      role="region"
      tabIndex={0}
    >
      <div className={view === 'week' ? 'min-w-[720px]' : 'min-w-0'}>
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
            scrollToHour === null ? null : Math.max(0, scrollToHour - 0.125)
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
            <Calendar.TimedEvents className="pl-1 text-xs" minHeight={28}>
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
              <NowMarker />
            </Calendar.NowMarker>
          </Calendar.DayColumns>
        </Calendar.TimeGrid>
      </div>
    </div>
  )
}
