import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CalendarRange, EventInput } from '../src/engine.js'
import CalendarFixture from './fixtures/CalendarFixture.svelte'

type Data = { title: string }
const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const events: EventInput<Data>[] = [
  {
    id: 'timed',
    start: '2026-03-18T09:00:00',
    end: '2026-03-18T10:00:00',
    data: { title: 'Planning' }
  },
  {
    id: 'all-day',
    allDay: true,
    start: '2026-03-17',
    end: '2026-03-20',
    data: { title: 'Offsite' }
  },
  {
    id: 'overlap',
    allDay: true,
    start: '2026-03-18',
    end: '2026-03-19',
    data: { title: 'Second event' }
  }
]

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Svelte calendar components', () => {
  it('renders timed and all-day events in week, month, and agenda scopes', () => {
    render(CalendarFixture, { props: { range, events } })
    expect(
      document.querySelector('[data-event-id="timed"] .timed-title')
        ?.textContent
    ).toBe('Planning')
    expect(document.querySelectorAll('.month-date')).toHaveLength(7)
    expect(document.querySelectorAll('.agenda-date')).toHaveLength(7)
    expect(
      document.querySelectorAll('.weekly-all-day[data-event-id="all-day"]')
    ).toHaveLength(1)
    expect(
      document
        .querySelector('.weekly-all-day[data-event-id="all-day"]')
        ?.getAttribute('style')
    ).toContain('height: 24px')
    expect(
      document.querySelector('[data-in-current-period="true"]')
    ).not.toBeNull()
  })

  it('updates keyed descendants when range, events, locale, and month lane props change', async () => {
    const view = render(CalendarFixture, { props: { range, events } })
    const nextEvents: EventInput<Data>[] = [
      {
        id: 'replacement',
        start: '2026-03-18T11:00:00',
        end: '2026-03-18T12:00:00',
        data: { title: 'New event' }
      },
      events[1],
      events[2]
    ]
    await view.rerender({
      range,
      events: nextEvents,
      locale: 'fr-FR',
      maxLanes: null,
      laneHeight: 31
    })
    expect(
      document.querySelectorAll('[data-event-id="replacement"]')
    ).not.toHaveLength(0)
    expect(
      document.querySelector('[data-event-id="replacement"] .timed-title')
        ?.textContent
    ).toBe('New event')
    expect(document.querySelector('[data-event-id="timed"]')).toBeNull()
    expect(document.querySelector('.month-date')?.textContent).toBe(
      '2026-03-16'
    )
    expect(
      document
        .querySelector('[data-event-id="replacement"]')
        ?.getAttribute('style')
    ).toContain('min-height: 22px')
    expect(
      document.querySelector('.weekly-all-day')?.getAttribute('style')
    ).toContain('height: 24px')
    expect(
      document
        .querySelector('[data-date="2026-03-16"]')
        ?.textContent?.toLowerCase()
    ).toContain('lun')
    await view.rerender({
      range: { ...range, currentDate: '2026-03-19' },
      events: nextEvents,
      locale: 'fr-FR',
      maxLanes: 1,
      laneHeight: 31
    })
    expect(
      [...document.querySelectorAll('.hidden-count')].some(
        (node) => node.textContent === '1'
      )
    ).toBe(true)
    expect(document.querySelector('[style*="height: 31px"]')).not.toBeNull()
  })

  it('collapses an empty all-day row unless minLanes reserves a lane', async () => {
    const view = render(CalendarFixture, {
      props: { range, events: [], minLanes: 0 }
    })
    expect(document.querySelector('.weekly-row')).toBeNull()
    await view.rerender({ range, events: [], minLanes: 1 })
    expect(document.querySelector('.weekly-row')).not.toBeNull()
    expect(
      document
        .querySelector('.weekly-row > div:nth-child(2)')
        ?.getAttribute('style')
    ).toContain('height: 24px')
  })

  it('reports known invalid-event failures and lets unexpected errors propagate', () => {
    const invalidEvents = [
      { id: 'broken', start: 'not a date' }
    ] as EventInput<Data>[]
    render(CalendarFixture, { props: { range, events: invalidEvents } })
    expect(screen.getByText('InvalidEventError')).toBeTruthy()
    cleanup()
    expect(() =>
      render(CalendarFixture, {
        props: { range, events: undefined as never }
      })
    ).toThrow(TypeError)
  })

  it('navigates through toolbar controls', async () => {
    const navigate = vi.fn()
    render(CalendarFixture, { props: { range, events, navigate } })
    await fireEvent.click(screen.getByRole('button', { name: 'Next period' }))
    expect(navigate).toHaveBeenCalledOnce()
    expect(navigate.mock.calls[0][0].view).toBe('week')
    expect(navigate.mock.calls[0][0].currentDate).toBe('2026-03-25')
  })

  it('scrolls to hour 7 by default and responds to hour-height updates', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(2400)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
    const view = render(CalendarFixture, { props: { range, events } })
    const scroller = document.querySelector<HTMLElement>(
      '[style*="overflow-y: auto"]'
    )!
    expect(window.getComputedStyle(scroller).overflowY).toBe('auto')
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(scroller.scrollTop).toBe(420)
    await view.rerender({ range, events, hourHeight: 80 })
    expect(scroller.scrollTop).toBe(560)
  })
})
