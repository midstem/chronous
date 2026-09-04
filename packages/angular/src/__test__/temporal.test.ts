import {
  Component,
  provideZonelessChangeDetection,
  signal
} from '@angular/core'
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
  selector: 'chronous-pending-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events; pending: waiting">
      <p data-testid="state">drawn</p>
    </div>

    <ng-template #waiting><p data-testid="state">loading</p></ng-template>
  `
})
class PendingHostComponent {
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
  it('loads the polyfill from the first read, with no setup call', async () => {
    await withoutTemporal(async ({ injectCalendar, MissingTemporalError }) => {
      const result = TestBed.runInInjectionContext(() =>
        injectCalendar(
          () => RANGE,
          () => []
        )
      )

      expect(result().pending).toBe(true)
      expect(result().calendar).toBeNull()
      expect(result().error).toBeInstanceOf(MissingTemporalError)

      await vi.waitFor(() => expect(result().pending).toBe(false))

      expect(result().error).toBeNull()
      expect(result().calendar?.days).toHaveLength(1)
    })
  })

  it('draws the pending template until the chunk lands', async () => {
    await withoutTemporal(async ({ CALENDAR_DIRECTIVES: fresh }) => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()]
      })
      TestBed.overrideComponent(PendingHostComponent, {
        set: { imports: [...fresh] }
      })

      const fixture = TestBed.createComponent(PendingHostComponent)

      fixture.detectChanges()

      expect(oneOf(fixture, 'state').textContent).toBe('loading')

      await vi.waitFor(() => {
        fixture.detectChanges()

        expect(oneOf(fixture, 'state').textContent).toBe('drawn')
      })
    })
  })

  it('revives navigation once the engine is in place', async () => {
    await withoutTemporal(async ({ injectCalendarNavigation }) => {
      const navigation = TestBed.runInInjectionContext(() =>
        injectCalendarNavigation(() => RANGE)
      )

      expect(navigation().next).toBeNull()

      await vi.waitFor(() => expect(navigation().next).not.toBeNull())

      expect(navigation().prev?.currentDate).toBe('2026-03-17')
      expect(navigation().today).not.toBeNull()
    })
  })
})

describe('a browser that ships Temporal', () => {
  it('draws the calendar on the first read, with no pending frame', () => {
    const result = TestBed.runInInjectionContext(() =>
      injectCalendarNative(
        () => RANGE,
        () => []
      )
    )

    expect(result().pending).toBe(false)
    expect(result().calendar?.days).toHaveLength(1)
  })

  it('draws the calendar rather than the pending template', () => {
    const fixture = mount(PendingHostComponent)

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
