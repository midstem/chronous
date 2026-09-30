import { get, writable } from 'svelte/store'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CalendarRange, EventInput } from '@midstem/chronous'
import {
  calendarNavigation,
  calendarResult,
  isTemporalAvailable,
  useCalendar,
  useCalendarNavigation,
  useNow
} from '../src'

const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const event: EventInput = {
  id: 'first',
  start: '2026-03-18T09:00:00',
  end: '2026-03-18T10:00:00'
}

afterEach(() => vi.useRealTimers())

describe('Svelte stores and utilities', () => {
  it('rebuilds when either input store changes', () => {
    const rangeStore = writable(range)
    const eventsStore = writable<readonly EventInput[]>([event])
    const calendar = useCalendar(rangeStore, eventsStore)
    expect(
      get(calendar).calendar?.days.flatMap((day) => day.boxes)[0].event.id
    ).toBe('first')
    eventsStore.set([
      { id: 'second', start: '2026-03-18T11:00:00', end: '2026-03-18T12:00:00' }
    ])
    expect(
      get(calendar).calendar?.days.flatMap((day) => day.boxes)[0].event.id
    ).toBe('second')
    rangeStore.set({ ...range, currentDate: '2026-03-19' })
    expect(get(calendar).calendar?.days[0].date).toBe('2026-03-16')
  })

  it('provides safe navigation values for static and changing ranges', () => {
    expect(calendarNavigation(range).next?.currentDate).toBe('2026-03-25')
    const store = writable(range)
    const navigation = useCalendarNavigation(store)
    expect(get(navigation).withView('month').view).toBe('month')
    store.set({ ...range, view: 'month' })
    expect(get(navigation).next?.currentDate).toBe('2026-04-01')
  })

  it('starts the now timer only for subscribers and clears it when they leave', () => {
    vi.useFakeTimers()
    const now = useNow('Europe/Kyiv')
    const unsubscribe = now.subscribe(() => {})
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(30_000)
    unsubscribe()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('returns a null clock for an unsupported zone and still clears its timer', () => {
    vi.useFakeTimers()
    const now = useNow('Not/AZone')
    let value: unknown = 'pending'
    const unsubscribe = now.subscribe((current) => {
      value = current
    })
    expect(value).toBeNull()
    expect(vi.getTimerCount()).toBe(1)
    unsubscribe()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('continues with the documented fallback when Temporal is absent', () => {
    const carrier = globalThis as unknown as { Temporal?: typeof Temporal }
    const held = carrier.Temporal
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      delete carrier.Temporal
      expect(isTemporalAvailable()).toBe(false)
      expect(calendarResult(range, []).calendar?.days).toHaveLength(7)
      expect(carrier.Temporal).toBeUndefined()
    } finally {
      carrier.Temporal = held
      warn.mockRestore()
    }
  })
})
