import {
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError
} from '@midstem/chronous'
import type { CalendarRange, EventInput, IsoDate } from '@midstem/chronous'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useCalendar } from '../index'

const ZONE = 'Europe/Kyiv'

const ANCHOR = '2026-03-18'

const SPEC: CalendarRange = { view: 'day', currentDate: ANCHOR, timeZone: ZONE }

const EVENTS: EventInput[] = [
  { id: 'a', start: '2026-03-18T09:00:00', end: '2026-03-18T10:30:00' }
]

const OTHER_EVENTS: EventInput[] = [
  { id: 'b', start: '2026-03-18T11:00:00', end: '2026-03-18T12:00:00' }
]

describe('useCalendar', () => {
  it('builds a calendar and reports no error', () => {
    const result = useCalendar(SPEC, EVENTS)

    expect(result.error.value).toBeNull()
    expect(result.calendar.value?.view).toBe('day')
    expect(result.calendar.value?.days[0].boxes).toHaveLength(1)
  })

  it('keeps the same result when an equal range literal comes back', () => {
    const at = ref<IsoDate>(ANCHOR)
    const events = ref<EventInput[]>(EVENTS)
    const result = useCalendar(
      () => ({ view: 'day', currentDate: at.value, timeZone: ZONE }),
      events
    )

    const first = result.calendar.value
    at.value = ANCHOR

    expect(result.calendar.value).toBe(first)
  })

  it('rebuilds when a range field changes', () => {
    const at = ref<IsoDate>(ANCHOR)
    const events = ref<EventInput[]>(EVENTS)
    const result = useCalendar(
      () => ({ view: 'day', currentDate: at.value, timeZone: ZONE }),
      events
    )

    const first = result.calendar.value
    at.value = '2026-03-19'

    expect(result.calendar.value).not.toBe(first)
    expect(result.calendar.value?.days[0].date).toBe('2026-03-19')
  })

  it('rebuilds when the events reference changes', () => {
    const at = ref<IsoDate>(ANCHOR)
    const events = ref<EventInput[]>(EVENTS)
    const result = useCalendar(
      () => ({ view: 'day', currentDate: at.value, timeZone: ZONE }),
      events
    )

    const first = result.calendar.value
    events.value = OTHER_EVENTS

    expect(result.calendar.value).not.toBe(first)
    expect(result.calendar.value?.days[0].boxes[0].event.id).toBe('b')
  })

  it('rebuilds when the range gains a field it did not carry', () => {
    const range = ref<CalendarRange>(SPEC)
    const result = useCalendar(range, EVENTS)

    const first = result.calendar.value
    range.value = { ...SPEC, slotMinutes: 30 }

    expect(result.calendar.value).not.toBe(first)
    expect(result.calendar.value?.days[0].slots).toHaveLength(48)
  })

  it('reports an unusable event instead of throwing', () => {
    const broken: EventInput[] = [{ id: 'a', start: 'not a date' }]
    const result = useCalendar(SPEC, broken)

    expect(result.calendar.value).toBeNull()
    expect(result.error.value).toBeInstanceOf(InvalidEventError)
  })

  it('reports an event that ends before it starts', () => {
    const broken: EventInput[] = [
      { id: 'a', start: '2026-03-18T10:00:00', end: '2026-03-18T09:00:00' }
    ]
    const result = useCalendar(SPEC, broken)

    expect(result.error.value).toBeInstanceOf(InvalidEventError)
  })

  it('reports an unreadable range instead of throwing', () => {
    const broken: CalendarRange = { ...SPEC, currentDate: 'not a date' }
    const result = useCalendar(broken, EVENTS)

    expect(result.calendar.value).toBeNull()
    expect(result.error.value).toBeInstanceOf(InvalidRangeError)
  })

  it('reports an unreadable time zone instead of throwing', () => {
    const broken: CalendarRange = { ...SPEC, timeZone: 'Not/AZone' }
    const result = useCalendar(broken, EVENTS)

    expect(result.calendar.value).toBeNull()
    expect(result.error.value).toBeInstanceOf(InvalidRangeError)
  })

  it('reports an out of range slot size instead of throwing', () => {
    const broken: CalendarRange = { ...SPEC, slotMinutes: 0 }
    const result = useCalendar(broken, EVENTS)

    expect(result.error.value).toBeInstanceOf(InvalidRangeError)
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
    const result = useCalendar(SPEC, broken)

    expect(result.calendar.value).toBeNull()
    expect(result.error.value).toBeInstanceOf(InvalidRecurrenceError)
  })

  it('lets an error that is not a calendar error through', () => {
    const missing = undefined as unknown as EventInput[]

    expect(() => {
      const res = useCalendar(SPEC, missing)
      return res.calendar.value
    }).toThrow(TypeError)
  })
})
