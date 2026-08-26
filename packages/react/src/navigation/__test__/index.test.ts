import type { Calendar, EventInput, RangeSpec } from '@midstem/chronous'
import { renderHook } from '@testing-library/react'
import type { RenderHookResult } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCalendar } from '#src/calendar'

import { useCalendarNavigation } from '../index'
import type { CalendarNavigation } from '../types'

const ZONE = 'Europe/Kyiv'

const ANCHOR = '2026-03-18'

const NO_EVENTS: EventInput[] = []

type NavigationProbe = {
  calendar: Calendar | null
  navigation: CalendarNavigation
}

const renderNavigation = (
  spec: RangeSpec
): RenderHookResult<NavigationProbe, { at: RangeSpec }> =>
  renderHook(
    ({ at }: { at: RangeSpec }) => {
      const { calendar } = useCalendar(at, NO_EVENTS)

      return { calendar, navigation: useCalendarNavigation(at) }
    },
    { initialProps: { at: spec } }
  )

const anchorOf = (spec: RangeSpec | null): string | undefined => spec?.date

describe('useCalendarNavigation', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('steps a week to either side of the one on screen', () => {
    const { result } = renderNavigation({
      view: 'week',
      date: ANCHOR,
      timeZone: ZONE
    })

    expect(anchorOf(result.current.navigation.next)).toBe('2026-03-25')
    expect(anchorOf(result.current.navigation.prev)).toBe('2026-03-11')
  })

  it('keeps the weekday of the anchor while stepping weeks', () => {
    const { result, rerender } = renderNavigation({
      view: 'week',
      date: ANCHOR,
      timeZone: ZONE
    })

    rerender({ at: result.current.navigation.next as RangeSpec })

    const shown = result.current.calendar?.days.filter((day) => day.inPeriod)

    expect(shown?.[0].date).toBe('2026-03-23')
    expect(shown?.[shown.length - 1].date).toBe('2026-03-29')
  })

  it('steps a month onto the first of the neighbouring month', () => {
    const { result } = renderNavigation({
      view: 'month',
      date: ANCHOR,
      timeZone: ZONE
    })

    expect(anchorOf(result.current.navigation.next)).toBe('2026-04-01')
    expect(anchorOf(result.current.navigation.prev)).toBe('2026-02-01')
  })

  it('lands the previous month on the month before the one on screen', () => {
    const { result, rerender } = renderNavigation({
      view: 'month',
      date: ANCHOR,
      timeZone: ZONE
    })

    rerender({ at: result.current.navigation.prev as RangeSpec })

    const shown = result.current.calendar?.days.filter((day) => day.inPeriod)

    expect(shown?.[0].date).toBe('2026-02-01')
    expect(shown?.[shown.length - 1].date).toBe('2026-02-28')
  })

  it('steps a span by its own length', () => {
    const { result } = renderNavigation({
      view: 'days',
      date: ANCHOR,
      timeZone: ZONE,
      dayCount: 3
    })

    expect(anchorOf(result.current.navigation.next)).toBe('2026-03-21')
    expect(anchorOf(result.current.navigation.prev)).toBe('2026-03-15')
  })

  it('steps an agenda by the length the range resolved to', () => {
    const { result } = renderNavigation({
      view: 'agenda',
      date: ANCHOR,
      timeZone: ZONE
    })
    const length = result.current.calendar?.days.length

    expect(length).toBe(30)
    expect(anchorOf(result.current.navigation.next)).toBe('2026-04-17')
    expect(anchorOf(result.current.navigation.prev)).toBe('2026-02-16')
  })

  it('keeps the days consecutive across a fall back transition', () => {
    const { result } = renderNavigation({
      view: 'day',
      date: '2026-10-25',
      timeZone: ZONE
    })

    expect(anchorOf(result.current.navigation.next)).toBe('2026-10-26')
    expect(anchorOf(result.current.navigation.prev)).toBe('2026-10-24')
  })

  it('steps over a day that has no midnight', () => {
    const { result } = renderNavigation({
      view: 'day',
      date: '2026-09-06',
      timeZone: 'America/Santiago'
    })

    expect(result.current.calendar?.days[0].date).toBe('2026-09-06')
    expect(anchorOf(result.current.navigation.next)).toBe('2026-09-07')
    expect(anchorOf(result.current.navigation.prev)).toBe('2026-09-05')
  })

  it('reads today in the zone of the calendar, not in UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T22:30:00Z'))

    const ahead = renderNavigation({
      view: 'day',
      date: ANCHOR,
      timeZone: 'Pacific/Kiritimati'
    })
    const behind = renderNavigation({
      view: 'day',
      date: ANCHOR,
      timeZone: 'Pacific/Honolulu'
    })

    expect(ahead.result.current.navigation.today?.().date).toBe('2026-08-22')
    expect(behind.result.current.navigation.today?.().date).toBe('2026-08-21')
  })

  it('reads today at the moment it is called, not at the last render', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T09:00:00Z'))

    const { result } = renderNavigation({
      view: 'day',
      date: ANCHOR,
      timeZone: ZONE
    })

    expect(result.current.navigation.today?.().date).toBe('2026-08-21')

    vi.setSystemTime(new Date('2026-08-22T09:00:00Z'))

    expect(result.current.navigation.today?.().date).toBe('2026-08-22')
  })

  it('carries the rest of the spec into every move', () => {
    const spec: RangeSpec = {
      view: 'week',
      date: ANCHOR,
      timeZone: ZONE,
      weekStartsOn: 0,
      slotMinutes: 30
    }
    const { result } = renderNavigation(spec)

    expect(result.current.navigation.next).toEqual({
      ...spec,
      date: '2026-03-25'
    })
    expect(result.current.navigation.withView('month')).toEqual({
      ...spec,
      view: 'month'
    })
  })

  it('has no today to read when the zone cannot be read', () => {
    const spec: RangeSpec = {
      view: 'day',
      date: ANCHOR,
      timeZone: 'Not/AZone'
    }
    const { result } = renderNavigation(spec)

    expect(result.current.calendar).toBeNull()
    expect(result.current.navigation.today).toBeNull()
    expect(result.current.navigation.withView('week').view).toBe('week')
  })

  it('still reads today when only the anchor date is unreadable', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-21T09:00:00Z'))

    const spec: RangeSpec = {
      view: 'day',
      date: 'not a date',
      timeZone: ZONE
    }
    const { result } = renderNavigation(spec)

    expect(result.current.calendar).toBeNull()
    expect(result.current.navigation.today?.().date).toBe('2026-08-21')
  })

  it('has nowhere to step when the anchor cannot be read', () => {
    const spec: RangeSpec = { view: 'day', date: 'not a date', timeZone: ZONE }
    const { result } = renderHook(() => useCalendarNavigation(spec))

    expect(result.current.next).toBeNull()
    expect(result.current.prev).toBeNull()
    expect(result.current.withView('week').view).toBe('week')
  })

  it('has nowhere to step when the span is not a whole number of days', () => {
    const spec: RangeSpec = {
      view: 'days',
      date: ANCHOR,
      timeZone: ZONE,
      dayCount: 2.5
    }
    const { result } = renderHook(() => useCalendarNavigation(spec))

    expect(result.current.next).toBeNull()
    expect(result.current.prev).toBeNull()
  })

  it('steps on a spec the calendar itself refuses', () => {
    const spec: RangeSpec = {
      view: 'day',
      date: ANCHOR,
      timeZone: 'Not/AZone'
    }
    const { result } = renderNavigation(spec)

    expect(result.current.calendar).toBeNull()
    expect(anchorOf(result.current.navigation.next)).toBe('2026-03-19')
  })

  it('holds its identity while the spec holds its own', () => {
    const { result, rerender } = renderNavigation({
      view: 'week',
      date: ANCHOR,
      timeZone: ZONE
    })
    const first = result.current.navigation

    rerender({ at: { view: 'week', date: ANCHOR, timeZone: ZONE } })

    expect(result.current.navigation).toBe(first)
  })
})
