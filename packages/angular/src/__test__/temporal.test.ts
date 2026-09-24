import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CALENDAR_DIRECTIVES } from '../directives'
import { injectCalendar as injectCalendarNative } from '../index'
import type { CalendarRange } from '../index'

import { mount, oneOf } from '../directives/__test__/helpers'

type TemporalCarrier = { Temporal?: typeof Temporal }

const carrier = globalThis as TemporalCarrier

const held = carrier.Temporal

const RANGE: CalendarRange = {
  view: 'day',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}

@Component({
  selector: 'chronous-temporal-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events">
      <p data-testid="state">drawn</p>
    </div>
  `
})
class TemporalHostComponent {
  readonly range = RANGE

  readonly events = []
}

const withoutTemporal = async <TResult>(
  run: (angular: typeof import('../index')) => Promise<TResult> | TResult
): Promise<TResult> => {
  vi.resetModules()
  delete carrier.Temporal

  try {
    return await run(await import('../index'))
  } finally {
    carrier.Temporal = held
  }
}

afterEach(() => {
  carrier.Temporal = held
  vi.resetModules()
})

describe('a browser with no Temporal', () => {
  it('reports an immediate missing Temporal error', async () => {
    await withoutTemporal(({ injectCalendar, MissingTemporalError }) => {
      const result = TestBed.runInInjectionContext(() =>
        injectCalendar(
          () => RANGE,
          () => []
        )
      )
      expect(result().calendar).toBeNull()
      expect(result().error).toBeInstanceOf(MissingTemporalError)
    })
  })
})

describe('a browser that ships Temporal', () => {
  it('draws the calendar on the first read', () => {
    const result = TestBed.runInInjectionContext(() =>
      injectCalendarNative(
        () => RANGE,
        () => []
      )
    )

    expect(result().calendar?.days).toHaveLength(1)
  })

  it('draws the calendar through the directive', () => {
    const fixture = mount(TemporalHostComponent)

    expect(oneOf(fixture, 'state').textContent).toBe('drawn')
  })
})

describe('a signal-driven range', () => {
  it('rebuilds only when the range actually changes', () => {
    const range = signal<CalendarRange>({ ...RANGE })
    const result = TestBed.runInInjectionContext(() =>
      injectCalendarNative(range, () => [])
    )

    const first = result().calendar

    range.set({ ...RANGE })

    expect(result().calendar).toBe(first)

    range.set({ ...RANGE, currentDate: '2026-03-19' })

    expect(result().calendar).not.toBe(first)
  })
})
