// @vitest-environment jsdom

import 'temporal-polyfill/global'

import {
  buildCalendar,
  calendarReducer,
  formatIso,
  initialCalendarState
} from '@midstem/chronous'
import type { CalendarRange } from '@midstem/chronous'
import { afterEach, describe, expect, it } from 'vitest'

import { simpleOf, snippetOf } from '../helpers'

const events = [
  {
    id: 'all-day',
    allDay: true as const,
    start: '2026-03-16',
    end: '2026-03-17',
    data: { title: 'All day <event>' }
  },
  {
    id: 'timed',
    allDay: false as const,
    start: '2026-03-16T09:00',
    end: '2026-03-16T10:00',
    data: { title: 'Timed "event" </script>' }
  },
  {
    id: 'escaped',
    allDay: false as const,
    start: '2026-03-16T11:00',
    end: '2026-03-16T12:00',
    data: { title: 'Quote "and" slash \\ <img src=x onerror=alert(1)>' }
  }
]

const range = (
  view: 'day' | 'week' | 'days' | 'month' | 'agenda'
): CalendarRange => ({
  view,
  currentDate: '2026-03-16',
  timeZone: 'UTC',
  weekStartsOn: 1,
  slotMinutes: 60,
  dayCount: 3
})

const activeCleanups = new Set<() => void>()

type GeneratedExecutor = (
  buildCalendarFn: typeof buildCalendar,
  formatIsoFn: typeof formatIso,
  reducer: typeof calendarReducer,
  initialState: typeof initialCalendarState,
  doc: Document,
  setIntervalFn: (callback: () => void, delay: number) => number,
  clearIntervalFn: (id: number) => void
) => (() => void) | undefined

afterEach(() => {
  for (const cleanup of activeCleanups) cleanup()
})

const runGenerated = (
  source: string
): {
  root: HTMLElement
  tick: () => void
  intervalMs: number | undefined
  dispose: () => void
  isIntervalCleared: () => boolean
} => {
  document.body.replaceChildren()
  const root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
  const executable = source
    .replace(/^import .*$/gm, '')
    .replace(/\bexport const /g, 'const ')
  let tick: () => void = () => {}
  let intervalMs: number | undefined
  let intervalCleared = false
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const execute = new Function(
    'buildCalendar',
    'formatIso',
    'calendarReducer',
    'initialCalendarState',
    'document',
    'setInterval',
    'clearInterval',
    `${executable}\nreturn typeof stopCalendarClock === "function" ? stopCalendarClock : undefined`
  ) as GeneratedExecutor
  const cleanup = execute(
    buildCalendar,
    formatIso,
    calendarReducer,
    initialCalendarState,
    document,
    (callback: () => void, delay: number) => {
      tick = callback
      intervalMs = delay
      return 1
    },
    (id: number) => {
      if (id === 1) intervalCleared = true
    }
  )
  const dispose = cleanup
    ? () => {
        cleanup()
        activeCleanups.delete(dispose)
      }
    : () => {}
  if (cleanup) activeCleanups.add(dispose)
  return {
    root: document.querySelector<HTMLElement>('#root')!,
    tick,
    intervalMs,
    dispose,
    isIntervalCleared: () => intervalCleared
  }
}

describe('generated vanilla snippets', () => {
  it('switches full renderers with real DOM buttons and keeps event labels literal', () => {
    const root = runGenerated(
      snippetOf(range('week'), events, 'en-US', 48)
    ).root
    expect(root.querySelector('[data-scroller]')).not.toBeNull()

    root.querySelector<HTMLButtonElement>('[data-view="month"]')!.click()
    expect(root.textContent).toContain('All day <event>')
    expect(root.querySelector('[data-scroller]')).not.toBeNull()
    expect(root.innerHTML).toContain('grid-template-columns: repeat(7')
    expect(root.querySelector('img')).toBeNull()
    expect(root.textContent).toContain(
      'Quote "and" slash \\ <img src=x onerror=alert(1)>'
    )

    root.querySelector<HTMLButtonElement>('[data-view="agenda"]')!.click()
    expect(root.textContent).toContain('Timed "event" </script>')
    expect(root.querySelector('ul.divide-y')).not.toBeNull()

    for (const view of ['day', 'week', 'days']) {
      root.querySelector<HTMLButtonElement>(`[data-view="${view}"]`)!.click()
      expect(root.querySelector('[data-scroller]')).not.toBeNull()
      expect(
        root.querySelector(`[aria-pressed="true"][data-view="${view}"]`)
      ).not.toBeNull()
      expect(root.textContent).toContain('All day <event>')
      expect(root.textContent).toContain('Timed "event" </script>')
      expect(root.textContent).toContain(
        'Quote "and" slash \\ <img src=x onerror=alert(1)>'
      )
      expect(
        root.querySelectorAll('[data-scroller] span.border-t').length
      ).toBeGreaterThan(1)
    }

    const before = root.querySelector('h2')?.textContent
    root.querySelector<HTMLButtonElement>('[data-nav="next"]')!.click()
    expect(root.querySelector('h2')?.textContent).not.toBe(before)
    expect(root.querySelector<HTMLElement>('[data-scroller]')?.scrollTop).toBe(
      336
    )
  })

  it('renders all-day and timed events in all five simple variants as plain JavaScript', () => {
    for (const view of ['day', 'week', 'days', 'month', 'agenda'] as const) {
      const source = simpleOf(range(view), events, 'en-US', 48)
      expect(source).not.toContain('type EventData')
      expect(source).not.toContain('EventInput<')
      expect(source).toContain('\\u003c')
      const root = runGenerated(source).root
      expect(root.textContent).toContain('All day <event>')
      expect(root.textContent).toContain('Timed "event" </script>')
      if (view === 'week' || view === 'day' || view === 'days') {
        expect(root.textContent).toContain('all-day')
        expect(
          root.querySelectorAll('[style*="height:"]').length
        ).toBeGreaterThan(1)
        expect(root.querySelectorAll('span.border-t').length).toBeGreaterThan(1)
      }
    }
  })

  it('keeps the full all-day strip visible and omits the simple strip when it is empty', () => {
    const fullRoot = runGenerated(
      snippetOf(range('week'), [], 'en-US', 48)
    ).root
    expect(fullRoot.textContent).toContain('all-day')

    const simpleRoot = runGenerated(
      simpleOf(range('week'), [], 'en-US', 48)
    ).root
    expect(simpleRoot.textContent).not.toContain('all-day')
  })

  it('clips full month lanes and reports the hidden all-day events', () => {
    const crowdedEvents = [
      ...events,
      ...['Third', 'Fourth', 'Fifth'].map((title, index) => ({
        id: `extra-${index}`,
        allDay: true as const,
        start: '2026-03-16',
        end: '2026-03-17',
        data: { title }
      }))
    ]
    const root = runGenerated(
      snippetOf(range('month'), crowdedEvents, 'en-US', 48)
    ).root
    expect(root.textContent).toContain('+2 more')
    expect(root.textContent).not.toContain('Fifth')
  })

  it('refreshes the clock every 30 seconds without moving the scroll position and returns cleanup', () => {
    const generated = runGenerated(
      snippetOf(range('week'), events, 'en-US', 48)
    )
    const scroller =
      generated.root.querySelector<HTMLElement>('[data-scroller]')!
    expect(generated.intervalMs).toBe(30_000)
    expect(scroller.scrollTop).toBe(336)

    scroller.scrollTop = 412
    const oldButton = generated.root.querySelector('[data-view="week"]')
    generated.tick()

    expect(generated.root.querySelector('[data-view="week"]')).not.toBe(
      oldButton
    )
    expect(
      generated.root.querySelector<HTMLElement>('[data-scroller]')?.scrollTop
    ).toBe(412)

    generated.dispose()
    expect(generated.isIntervalCleared()).toBe(true)
  })
})
