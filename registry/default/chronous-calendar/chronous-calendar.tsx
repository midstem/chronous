'use client'

import 'temporal-polyfill/global'

import type { ReactElement } from 'react'
import {
  Calendar,
  EMPTY_EVENTS,
  useCalendarState,
  type ChronousCalendarProps
} from './chronous-calendar/calendar'
import { CalendarToolbar } from './chronous-calendar/toolbar'
import { CalendarView } from './chronous-calendar/views'

export type {
  ChronousCalendarEventColor,
  ChronousCalendarEventData,
  ChronousCalendarProps,
  ChronousCalendarView
} from './chronous-calendar/calendar'

export function ChronousCalendar({
  events = EMPTY_EVENTS,
  initialDate,
  initialView = 'week',
  timeZone: requestedTimeZone,
  locale = 'en-US',
  scrollToHour = 8,
  className = ''
}: ChronousCalendarProps): ReactElement {
  const { visibleRange, navigation, today, goTo, goToView } = useCalendarState({
    initialDate,
    initialView,
    requestedTimeZone
  })

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
          const hasEvents =
            calendar.days.some((day) => day.boxes.length > 0) ||
            calendar.rows.some((row) => row.bars.length > 0)

          return (
            <>
              <CalendarToolbar
                calendar={calendar}
                range={visibleRange}
                locale={locale}
                navigation={navigation}
                onNavigate={goTo}
                onView={goToView}
              />
              <CalendarView
                view={visibleRange.view}
                locale={locale}
                today={today}
                scrollToHour={scrollToHour}
                hasEvents={hasEvents}
              />
            </>
          )
        }}
      </Calendar.Root>
    </section>
  )
}
