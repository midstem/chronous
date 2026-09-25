import type { CalendarRange, EventInput } from '@midstem/chronous'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useCalendar } from '#src/calendar'

import { useCalendarNavigation } from '../index'

const ZONE = 'Europe/Kyiv'

const ANCHOR = '2026-03-18'

const NO_EVENTS: EventInput[] = []

const anchorOf = (range: CalendarRange | null): string | undefined =>
  range?.currentDate

describe('useCalendarNavigation', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('steps a week to either side of the one on screen', () => {
    const range = ref<CalendarRange>({
      view: 'week',
      currentDate: ANCHOR,
      timeZone: ZONE
    })
    const navigation = useCalendarNavigation(range)

    expect(anchorOf(navigation.next.value)).toBe('2026-03-25')
    expect(anchorOf(navigation.prev.value)).toBe('2026-03-11')
  })

  it('keeps the weekday of the anchor while stepping weeks', () => {
    const range = ref<CalendarRange>({
      view: 'week',
      currentDate: ANCHOR,
      timeZone: ZONE
    })
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    range.value = navigation.next.value as CalendarRange

    const shown = calendar.value?.days.filter((day) => day.inCurrentPeriod)

    expect(shown?.[0].date).toBe('2026-03-23')
    expect(shown?.[shown.length - 1].date).toBe('2026-03-29')
  })

  it('steps a month onto the first of the neighbouring month', () => {
    const range: CalendarRange = {
      view: 'month',
      currentDate: ANCHOR,
      timeZone: ZONE
    }
    const navigation = useCalendarNavigation(range)

    expect(anchorOf(navigation.next.value)).toBe('2026-04-01')
    expect(anchorOf(navigation.prev.value)).toBe('2026-02-01')
  })

  it('lands the previous month on the month before the one on screen', () => {
    const range = ref<CalendarRange>({
      view: 'month',
      currentDate: ANCHOR,
      timeZone: ZONE
    })
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    range.value = navigation.prev.value as CalendarRange

    const shown = calendar.value?.days.filter((day) => day.inCurrentPeriod)

    expect(shown?.[0].date).toBe('2026-02-01')
    expect(shown?.[shown.length - 1].date).toBe('2026-02-28')
  })

  it('steps a span by its own length', () => {
    const navigation = useCalendarNavigation({
      view: 'days',
      currentDate: ANCHOR,
      timeZone: ZONE,
      dayCount: 3
    })

    expect(anchorOf(navigation.next.value)).toBe('2026-03-21')
    expect(anchorOf(navigation.prev.value)).toBe('2026-03-15')
  })

  it('steps an agenda by the length the range resolved to', () => {
    const range: CalendarRange = {
      view: 'agenda',
      currentDate: ANCHOR,
      timeZone: ZONE
    }
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    const length = calendar.value?.days.length

    expect(length).toBe(30)
    expect(anchorOf(navigation.next.value)).toBe('2026-04-17')
    expect(anchorOf(navigation.prev.value)).toBe('2026-02-16')
  })

  it('keeps the days consecutive across a fall back transition', () => {
    const navigation = useCalendarNavigation({
      view: 'day',
      currentDate: '2026-10-25',
      timeZone: ZONE
    })

    expect(anchorOf(navigation.next.value)).toBe('2026-10-26')
    expect(anchorOf(navigation.prev.value)).toBe('2026-10-24')
  })

  it('steps over a day that has no midnight', () => {
    const range: CalendarRange = {
      view: 'day',
      currentDate: '2026-09-06',
      timeZone: 'America/Santiago'
    }
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    expect(calendar.value?.days[0].date).toBe('2026-09-06')
    expect(anchorOf(navigation.next.value)).toBe('2026-09-07')
    expect(anchorOf(navigation.prev.value)).toBe('2026-09-05')
  })

  it('reads today in the zone of the calendar, not in UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T22:30:00Z'))

    const ahead = useCalendarNavigation({
      view: 'day',
      currentDate: ANCHOR,
      timeZone: 'Pacific/Kiritimati'
    })
    const behind = useCalendarNavigation({
      view: 'day',
      currentDate: ANCHOR,
      timeZone: 'Pacific/Honolulu'
    })

    expect(ahead.today.value?.().currentDate).toBe('2026-08-22')
    expect(behind.today.value?.().currentDate).toBe('2026-08-21')
  })

  it('reads today at the moment it is called, not at the last render', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T09:00:00Z'))

    const navigation = useCalendarNavigation({
      view: 'day',
      currentDate: ANCHOR,
      timeZone: ZONE
    })

    expect(navigation.today.value?.().currentDate).toBe('2026-08-21')

    vi.setSystemTime(new Date('2026-08-22T09:00:00Z'))

    expect(navigation.today.value?.().currentDate).toBe('2026-08-22')
  })

  it('carries the rest of the range into every move', () => {
    const range: CalendarRange = {
      view: 'week',
      currentDate: ANCHOR,
      timeZone: ZONE,
      weekStartsOn: 0,
      slotMinutes: 30
    }
    const navigation = useCalendarNavigation(range)

    expect(navigation.next.value).toEqual({
      ...range,
      currentDate: '2026-03-25'
    })
    expect(navigation.withView('month')).toEqual({
      ...range,
      view: 'month'
    })
  })

  it('has no today to read when the zone cannot be read', () => {
    const range: CalendarRange = {
      view: 'day',
      currentDate: ANCHOR,
      timeZone: 'Not/AZone'
    }
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    expect(calendar.value).toBeNull()
    expect(navigation.today.value).toBeNull()
    expect(navigation.withView('week').view).toBe('week')
  })

  it('still reads today when only the anchor date is unreadable', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T09:00:00Z'))

    const range: CalendarRange = {
      view: 'day',
      currentDate: 'not a date',
      timeZone: ZONE
    }
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    expect(calendar.value).toBeNull()
    expect(navigation.today.value?.().currentDate).toBe('2026-08-21')
  })

  it('has nowhere to step when the anchor cannot be read', () => {
    const range: CalendarRange = {
      view: 'day',
      currentDate: 'not a date',
      timeZone: ZONE
    }
    const navigation = useCalendarNavigation(range)

    expect(navigation.next.value).toBeNull()
    expect(navigation.prev.value).toBeNull()
    expect(navigation.withView('week').view).toBe('week')
  })

  it('has nowhere to step when the span is not a whole number of days', () => {
    const range: CalendarRange = {
      view: 'days',
      currentDate: ANCHOR,
      timeZone: ZONE,
      dayCount: 2.5
    }
    const navigation = useCalendarNavigation(range)

    expect(navigation.next.value).toBeNull()
    expect(navigation.prev.value).toBeNull()
  })

  it('steps on a range the calendar itself refuses', () => {
    const range: CalendarRange = {
      view: 'day',
      currentDate: ANCHOR,
      timeZone: 'Not/AZone'
    }
    const { calendar } = useCalendar(range, NO_EVENTS)
    const navigation = useCalendarNavigation(range)

    expect(calendar.value).toBeNull()
    expect(anchorOf(navigation.next.value)).toBe('2026-03-19')
  })

  it('holds its identity while the range holds its own', () => {
    const range = ref<CalendarRange>({
      view: 'week',
      currentDate: ANCHOR,
      timeZone: ZONE
    })
    const navigation = useCalendarNavigation(range)
    const first = navigation.value

    range.value = {
      view: 'week',
      currentDate: ANCHOR,
      timeZone: ZONE
    }

    expect(navigation.value).toBe(first)
  })
})
