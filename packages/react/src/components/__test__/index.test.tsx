import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Calendar, createCalendarComponents } from '../../index'
import type { EventData } from './fixtures'
import { EVENTS, LOCALE, WEEK } from './fixtures'

const styleOf = (element: HTMLElement): string =>
  element.getAttribute('style') ?? ''

const textOf = (element: HTMLElement): string => element.textContent ?? ''

const Week = ({ gutterWidth }: { gutterWidth?: string }): ReactNode => (
  <Calendar.Root
    range={WEEK}
    events={EVENTS}
    locale={LOCALE}
    gutterWidth={gutterWidth}
  >
    <Calendar.Header data-testid="header">
      <Calendar.DayHeadings data-testid="heading" />
    </Calendar.Header>

    <Calendar.AllDayRow data-testid="all-day" gutterCell="all-day">
      <Calendar.AllDayEvents data-testid="bar" />
    </Calendar.AllDayRow>

    <Calendar.TimeGrid data-testid="grid">
      <Calendar.TimeAxis data-testid="axis">
        <Calendar.TimeLabels data-testid="label" />
      </Calendar.TimeAxis>

      <Calendar.DayColumns data-testid="column">
        <Calendar.TimeSlots data-testid="slot" />
        <Calendar.TimedEvents data-testid="event" />
      </Calendar.DayColumns>
    </Calendar.TimeGrid>
  </Calendar.Root>
)

describe('the slotted view', () => {
  it('renders a heading and a column for every day of the range', () => {
    render(<Week />)

    expect(screen.getAllByTestId('heading')).toHaveLength(7)
    expect(screen.getAllByTestId('column')).toHaveLength(7)
  })

  it('labels a heading with the weekday and the day number by default', () => {
    render(<Week />)

    expect(textOf(screen.getAllByTestId('heading')[0])).toBe('Mon 16')
  })

  it('draws a line and a gutter label for every slot of the day', () => {
    render(<Week />)

    expect(screen.getAllByTestId('label')).toHaveLength(24)
    expect(screen.getAllByTestId('slot')).toHaveLength(24 * 7)
  })

  it('reads a gutter label off the slot rather than off the wall clock', () => {
    render(<Week />)

    expect(textOf(screen.getAllByTestId('label')[0])).toBe('00:00')
    expect(textOf(screen.getAllByTestId('label')[9])).toBe('09:00')
  })

  it('places a timed event on the geometry the engine handed back', () => {
    render(<Week />)

    const [standup, review] = screen.getAllByTestId('event')

    expect(textOf(standup)).toBe('standup')
    expect(styleOf(standup)).toContain('top: 37.5%')
    expect(styleOf(standup)).toContain('height: 6.25%')
    expect(styleOf(standup)).toContain('left: 0%')
    expect(styleOf(standup)).toContain('width: calc(50% - 3px)')
    expect(styleOf(review)).toContain('left: 50%')
  })

  it('spreads an all-day event across the days it covers', () => {
    render(<Week />)

    const bar = screen.getByTestId('bar')

    expect(textOf(bar)).toBe('offsite')
    expect(styleOf(bar)).toContain('+ 2px')
    expect(styleOf(bar)).toContain('- 4px')
  })

  it('drops the all-day row when the range holds no all-day event', () => {
    render(
      <Calendar.Root range={WEEK} events={[]}>
        <Calendar.AllDayRow data-testid="all-day">
          <Calendar.AllDayEvents />
        </Calendar.AllDayRow>
      </Calendar.Root>
    )

    expect(screen.queryByTestId('all-day')).toBeNull()
  })
})

describe('a component slot', () => {
  it('hands the scope to a render prop', () => {
    render(
      <Calendar.Root range={WEEK} events={EVENTS} locale={LOCALE}>
        <Calendar.Header>
          <Calendar.DayHeadings data-testid="heading">
            {({ weekdayLabel, dayLabel, inCurrentPeriod }) =>
              `${weekdayLabel}/${dayLabel}/${String(inCurrentPeriod)}`
            }
          </Calendar.DayHeadings>
        </Calendar.Header>
      </Calendar.Root>
    )

    expect(textOf(screen.getAllByTestId('heading')[0])).toBe('Mon/16/true')
  })

  it('accepts a plain node in place of a render prop', () => {
    render(
      <Calendar.Root range={WEEK} events={EVENTS}>
        <Calendar.Header>
          <Calendar.DayHeadings data-testid="heading">
            <span>fixed</span>
          </Calendar.DayHeadings>
        </Calendar.Header>
      </Calendar.Root>
    )

    expect(textOf(screen.getAllByTestId('heading')[0])).toBe('fixed')
  })
})

describe('the polymorphic surface', () => {
  it('renders the tag asked for and forwards its DOM props', () => {
    const onClick = vi.fn()

    render(
      <Calendar.Root range={WEEK} events={EVENTS}>
        <Calendar.TimeGrid>
          <Calendar.DayColumns>
            <Calendar.TimedEvents
              as="button"
              type="button"
              onClick={onClick}
              data-testid="event"
            />
          </Calendar.DayColumns>
        </Calendar.TimeGrid>
      </Calendar.Root>
    )

    const [standup] = screen.getAllByTestId('event')

    expect(standup.tagName).toBe('BUTTON')

    standup.click()

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('lets a consumer style win over the layout it computed', () => {
    render(
      <Calendar.Root range={WEEK} events={EVENTS}>
        <Calendar.TimeGrid>
          <Calendar.DayColumns>
            <Calendar.TimedEvents
              data-testid="event"
              style={{ top: '10%', color: 'red' }}
            />
          </Calendar.DayColumns>
        </Calendar.TimeGrid>
      </Calendar.Root>
    )

    const [standup] = screen.getAllByTestId('event')

    expect(styleOf(standup)).toContain('top: 10%')
    expect(styleOf(standup)).toContain('color: red')
    expect(styleOf(standup)).toContain('height: 6.25%')
  })
})

describe('state a stylesheet can reach', () => {
  it('marks a day with its date and whether it is in the period', () => {
    render(<Week />)

    const [first] = screen.getAllByTestId('heading')

    expect(first.getAttribute('data-date')).toBe('2026-03-16')
    expect(first.getAttribute('data-in-current-period')).toBe('true')
  })

  it('marks an event with its id and the edges it runs past', () => {
    render(<Week />)

    const bar = screen.getByTestId('bar')

    expect(bar.getAttribute('data-event-id')).toBe('offsite')
    expect(bar.getAttribute('data-continues-before')).toBe('false')
  })

  it('lets a consumer prop win over the attribute it sets', () => {
    render(
      <Calendar.Root range={WEEK} events={EVENTS}>
        <Calendar.Header>
          <Calendar.DayHeadings data-testid="heading" data-date="pinned" />
        </Calendar.Header>
      </Calendar.Root>
    )

    expect(screen.getAllByTestId('heading')[0].getAttribute('data-date')).toBe(
      'pinned'
    )
  })
})

describe('the gutter', () => {
  it('is read from the root so the three grids stay in step', () => {
    const { container } = render(<Week gutterWidth="5rem" />)

    const grids = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[style*="grid-template-columns"]'
      )
    )

    expect(grids).toHaveLength(3)

    grids.forEach((grid) => {
      expect(styleOf(grid)).toContain('5rem repeat(7, minmax(0, 1fr))')
    })
  })
})

describe('a scope', () => {
  it('names the parent a component has to sit under', () => {
    expect(() => render(<Calendar.TimedEvents />)).toThrow(
      'DayColumnContext is only readable inside <Calendar.DayColumns>'
    )
  })
})

describe('createCalendarComponents', () => {
  it('carries the event data type into every render prop', () => {
    const Typed = createCalendarComponents<EventData>()

    render(
      <Typed.Root range={WEEK} events={EVENTS}>
        <Typed.TimeGrid>
          <Typed.DayColumns>
            <Typed.TimedEvents data-testid="event">
              {({ event }) => event.data?.title}
            </Typed.TimedEvents>
          </Typed.DayColumns>
        </Typed.TimeGrid>
      </Typed.Root>
    )

    expect(textOf(screen.getAllByTestId('event')[0])).toBe('Standup')
  })
})
