import 'temporal-polyfill/global'

import { useEffect, useRef, useState } from 'react'
import {
  createCalendarComponents,
  formatIso,
  useCalendarNavigation
} from '@midstem/chronous-react'
import type {
  CalendarNavigation,
  CalendarRange,
  EventInput,
  LocaleId,
  ViewKind
} from '@midstem/chronous-react'

export type ChronousCalendarEventColor =
  'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

export type ChronousCalendarEventData = {
  title: string
  color?: ChronousCalendarEventColor
}

export type ChronousCalendarView = Extract<
  ViewKind,
  'day' | 'week' | 'month' | 'agenda'
>

export type ChronousCalendarProps = {
  events?: readonly EventInput<ChronousCalendarEventData>[]
  initialDate?: string
  initialView?: ChronousCalendarView
  timeZone?: string
  locale?: LocaleId
  scrollToHour?: number | null
  className?: string
}

export const Calendar = createCalendarComponents<ChronousCalendarEventData>()
export const EMPTY_EVENTS: readonly EventInput<ChronousCalendarEventData>[] = []
export const MONTH_YEAR = { month: 'long', year: 'numeric' } as const
export const WEEK_DAY = { month: 'short', day: 'numeric' } as const
export const EVENT_CLOCK = { hour: '2-digit', minute: '2-digit' } as const

export const todayInTimeZone = (timeZone: string): string => {
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

export const periodLabel = (
  calendar: { days: { date: string; inCurrentPeriod: boolean }[] },
  range: CalendarRange,
  locale: LocaleId
): string => {
  if (range.view === 'day') return dateLabel(range.currentDate, locale)

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

export const dateLabel = (date: string, locale: LocaleId): string =>
  formatIso(date, { locale, options: WEEK_DAY })

export const clockLabel = (minuteOfDay: number): string => {
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export const useCalendarState = ({
  initialDate,
  initialView,
  requestedTimeZone
}: {
  initialDate?: string
  initialView: ChronousCalendarView
  requestedTimeZone?: string
}): {
  visibleRange: CalendarRange
  navigation: CalendarNavigation
  today: string
  goTo: (nextRange: CalendarRange | null) => void
  goToView: (view: ChronousCalendarView) => void
} => {
  const initialSettings = useRef({
    hasInitialDate: initialDate !== undefined,
    hasExplicitTimeZone: requestedTimeZone !== undefined
  })
  const [localTimeZone, setLocalTimeZone] = useState<string | null>(null)
  const [range, setRange] = useState<CalendarRange>(() => ({
    view: initialView,
    currentDate: initialDate ?? todayInTimeZone(requestedTimeZone ?? 'UTC'),
    timeZone: requestedTimeZone ?? 'UTC'
  }))
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

  return {
    visibleRange,
    navigation,
    today,
    goTo,
    goToView: (view: ChronousCalendarView): void => {
      setRange(navigation.withView(view))
    }
  }
}
