import {
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError
} from '@midstem/chronous'
import type { EventInput, IsoDate, RangeSpec } from '@midstem/chronous'
import { renderHook } from '@testing-library/react'
import type { RenderHookResult } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCalendar } from '../index'
import type { CalendarResult } from '../types'

const ZONE = 'Europe/Kyiv'

const ANCHOR = '2026-03-18'

const SPEC: RangeSpec = { view: 'day', date: ANCHOR, timeZone: ZONE }

const EVENTS: EventInput[] = [
  { id: 'a', start: '2026-03-18T09:00:00', end: '2026-03-18T10:30:00' }
]

const OTHER_EVENTS: EventInput[] = [
  { id: 'b', start: '2026-03-18T11:00:00', end: '2026-03-18T12:00:00' }
]

type CalendarProps = { at: IsoDate; events: EventInput[] }

const renderAt = (
  date: IsoDate
): RenderHookResult<CalendarResult, CalendarProps> =>
  renderHook(
    ({ at, events }: CalendarProps) =>
      useCalendar({ view: 'day', date: at, timeZone: ZONE }, events),
    { initialProps: { at: date, events: EVENTS } }
  )

describe('useCalendar', () => {
  it('builds a calendar and reports no error', () => {
    const { result } = renderHook(() => useCalendar(SPEC, EVENTS))

    expect(result.current.error).toBeNull()
    expect(result.current.calendar?.view).toBe('day')
    expect(result.current.calendar?.days[0].boxes).toHaveLength(1)
  })

  it('keeps the same result when an equal spec literal comes back', () => {
    const { result, rerender } = renderAt(ANCHOR)
    const first = result.current

    rerender({ at: ANCHOR, events: EVENTS })

    expect(result.current).toBe(first)
  })

  it('rebuilds when a spec field changes', () => {
    const { result, rerender } = renderAt(ANCHOR)
    const first = result.current

    rerender({ at: '2026-03-19', events: EVENTS })

    expect(result.current).not.toBe(first)
    expect(result.current.calendar?.days[0].date).toBe('2026-03-19')
  })

  it('rebuilds when the events reference changes', () => {
    const { result, rerender } = renderAt(ANCHOR)
    const first = result.current

    rerender({ at: ANCHOR, events: OTHER_EVENTS })

    expect(result.current).not.toBe(first)
    expect(result.current.calendar?.days[0].boxes[0].event.id).toBe('b')
  })

  it('rebuilds when the spec gains a field it did not carry', () => {
    const { result, rerender } = renderHook(
      ({ at }: { at: RangeSpec }) => useCalendar(at, EVENTS),
      { initialProps: { at: SPEC } }
    )
    const first = result.current

    rerender({ at: { ...SPEC, slotMinutes: 30 } })

    expect(result.current).not.toBe(first)
    expect(result.current.calendar?.days[0].slots).toHaveLength(48)
  })

  it('reports an unusable event instead of throwing', () => {
    const broken: EventInput[] = [{ id: 'a', start: 'not a date' }]
    const { result } = renderHook(() => useCalendar(SPEC, broken))

    expect(result.current.calendar).toBeNull()
    expect(result.current.error).toBeInstanceOf(InvalidEventError)
  })

  it('reports an event that ends before it starts', () => {
    const broken: EventInput[] = [
      { id: 'a', start: '2026-03-18T10:00:00', end: '2026-03-18T09:00:00' }
    ]
    const { result } = renderHook(() => useCalendar(SPEC, broken))

    expect(result.current.error).toBeInstanceOf(InvalidEventError)
  })

  it('reports an unreadable spec instead of throwing', () => {
    const broken: RangeSpec = { ...SPEC, date: 'not a date' }
    const { result } = renderHook(() => useCalendar(broken, EVENTS))

    expect(result.current.calendar).toBeNull()
    expect(result.current.error).toBeInstanceOf(InvalidRangeError)
  })

  it('reports an unreadable time zone instead of throwing', () => {
    const broken: RangeSpec = { ...SPEC, timeZone: 'Not/AZone' }
    const { result } = renderHook(() => useCalendar(broken, EVENTS))

    expect(result.current.calendar).toBeNull()
    expect(result.current.error).toBeInstanceOf(InvalidRangeError)
  })

  it('reports an out of range slot size instead of throwing', () => {
    const broken: RangeSpec = { ...SPEC, slotMinutes: 0 }
    const { result } = renderHook(() => useCalendar(broken, EVENTS))

    expect(result.current.error).toBeInstanceOf(InvalidRangeError)
  })

  it('reports an unreadable recurrence rule instead of throwing', () => {
    const broken: EventInput[] = [
      {
        id: 'a',
        start: '2026-03-18T09:00:00',
        duration: 'PT30M',
        recurrence: { rule: 'FREQ=HOURLY' }
      }
    ]
    const { result } = renderHook(() => useCalendar(SPEC, broken))

    expect(result.current.calendar).toBeNull()
    expect(result.current.error).toBeInstanceOf(InvalidRecurrenceError)
  })

  it('lets an error that is not a calendar error through', () => {
    const missing = undefined as unknown as EventInput[]

    expect(() => renderHook(() => useCalendar(SPEC, missing))).toThrow(
      TypeError
    )
  })
})
