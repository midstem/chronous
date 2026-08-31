import type { CalendarRange } from '@midstem/chronous'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Calendar } from '../../index'
import { AGENDA, EVENTS, LOCALE, MONTH, WEEK, ZONE } from './fixtures'

const styleOf = (element: HTMLElement): string =>
  element.getAttribute('style') ?? ''

const textOf = (element: HTMLElement): string => element.textContent ?? ''

const textsOf = (id: string): string[] =>
  screen.queryAllByTestId(id).map(textOf)

describe('the month view', () => {
  const Month = (): React.ReactNode => (
    <Calendar.Root range={MONTH} events={EVENTS} locale={LOCALE}>
      <Calendar.MonthGrid data-testid="month">
        <Calendar.MonthWeekdays data-testid="weekday" />
        <Calendar.MonthRows data-testid="row">
          <Calendar.MonthDays data-testid="day">
            {({ dayNumber, lanes }) => (
              <>
                <span>{dayNumber}</span>
                <span data-testid="lanes">{lanes}</span>
                <Calendar.MonthTimedEvents data-testid="entry" />
              </>
            )}
          </Calendar.MonthDays>
          <Calendar.MonthAllDayEvents data-testid="bar" />
        </Calendar.MonthRows>
      </Calendar.MonthGrid>
    </Calendar.Root>
  )

  it('lays a row out as its own grid of days', () => {
    render(<Month />)

    expect(screen.getAllByTestId('weekday')).toHaveLength(7)
    expect(screen.getAllByTestId('row')).toHaveLength(6)
    expect(screen.getAllByTestId('day')).toHaveLength(42)
    expect(styleOf(screen.getAllByTestId('row')[0])).toContain(
      'grid-template-columns: repeat(7, minmax(0, 1fr))'
    )
  })

  it('offsets a bar past the day number and keeps it clickable', () => {
    render(<Month />)

    const bar = screen.getByTestId('bar')

    expect(textOf(bar)).toBe('offsite')
    expect(styleOf(bar)).toContain('top: 28px')
    expect(styleOf(bar)).not.toContain('pointer-events: none')
  })

  it('tells a cell how many lanes the bars above it take', () => {
    render(<Month />)

    const lanes = textsOf('lanes')

    expect(new Set(lanes)).toEqual(new Set(['0', '1']))
    expect(lanes.filter((count) => count === '1')).toHaveLength(7)
  })

  it('lists every timed event of a day in its cell', () => {
    render(<Month />)

    expect(textsOf('entry')).toEqual(['standup', 'review'])
  })
})

describe('the agenda view', () => {
  const Agenda = ({ showEmpty }: { showEmpty?: boolean }): React.ReactNode => (
    <Calendar.Root range={AGENDA} events={EVENTS} locale={LOCALE}>
      <Calendar.AgendaList data-testid="list">
        <Calendar.AgendaDays data-testid="day" showEmpty={showEmpty}>
          {({ month, dayNumber }) => (
            <>
              <span data-testid="heading">{`${dayNumber} ${month}`}</span>
              <Calendar.AgendaAllDayEvents data-testid="bar" />
              <Calendar.AgendaTimedEvents data-testid="box" />
            </>
          )}
        </Calendar.AgendaDays>
      </Calendar.AgendaList>
    </Calendar.Root>
  )

  it('keeps only the days that carry something', () => {
    render(<Agenda />)

    expect(screen.getAllByTestId('day')).toHaveLength(2)
    expect(screen.getAllByTestId('bar')).toHaveLength(2)
    expect(screen.getAllByTestId('box')).toHaveLength(2)
  })

  it('keeps the empty days when it is asked to', () => {
    render(<Agenda showEmpty />)

    expect(screen.getAllByTestId('day').length).toBeGreaterThan(2)
  })

  it('labels a timed event with the range it covers', () => {
    render(<Agenda />)

    expect(textsOf('box')[0]).toBe('09:00 – 10:30')
  })

  it('names the month a floating date falls in', () => {
    render(<Agenda showEmpty />)

    expect(textsOf('heading')).toContain('1 Apr')
  })
})

describe('the now marker', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const DayAt = (): React.ReactNode => (
    <Calendar.Root
      range={{ view: 'day', date: '2026-03-18', timeZone: ZONE }}
      events={EVENTS}
    >
      <Calendar.TimeGrid>
        <Calendar.DayColumns>
          <Calendar.NowMarker data-testid="now" />
        </Calendar.DayColumns>
      </Calendar.TimeGrid>
    </Calendar.Root>
  )

  it('sits at the current minute of the day it belongs to', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T09:30:00+02:00'))

    render(<DayAt />)

    expect(styleOf(screen.getByTestId('now'))).toContain('top: 39.58')
  })

  it('stays away from a day the clock is not on', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-19T09:30:00+02:00'))

    render(<DayAt />)

    expect(screen.queryByTestId('now')).toBeNull()
  })
})

describe('the toolbar', () => {
  const Toolbar = ({
    onNavigate
  }: {
    onNavigate: (range: CalendarRange) => void
  }): React.ReactNode => (
    <Calendar.Root range={WEEK} events={EVENTS} locale={LOCALE}>
      <Calendar.Toolbar onNavigate={onNavigate} views={['week', 'month']} />
    </Calendar.Root>
  )

  it('steps the range the engine handed it', () => {
    const onNavigate = vi.fn()

    render(<Toolbar onNavigate={onNavigate} />)

    screen.getByLabelText('Next period').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-03-25', view: 'week' })
    )
  })

  it('marks the view the calendar is showing', () => {
    render(<Toolbar onNavigate={vi.fn()} />)

    expect(screen.getByText('week').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('month').getAttribute('aria-pressed')).toBe('false')
  })
})

describe('the root', () => {
  const BAD: CalendarRange = { ...WEEK, timeZone: 'Not/AZone' }

  it('hands an unusable range to the fallback it was given', () => {
    render(
      <Calendar.Root
        range={BAD}
        events={EVENTS}
        renderError={(error) => <p data-testid="failed">{error.name}</p>}
      >
        <Calendar.Header />
      </Calendar.Root>
    )

    expect(textOf(screen.getByTestId('failed'))).toBe('InvalidRangeError')
  })

  it('keeps its own element around the fallback', () => {
    const { container } = render(
      <Calendar.Root
        range={BAD}
        events={EVENTS}
        className="shell"
        renderError={() => <p>failed</p>}
      >
        <Calendar.Header />
      </Calendar.Root>
    )

    expect(container.querySelector('.shell')?.textContent).toBe('failed')
  })

  it('lets the error through when no fallback is given', () => {
    expect(() =>
      render(
        <Calendar.Root range={BAD} events={EVENTS}>
          <Calendar.Header />
        </Calendar.Root>
      )
    ).toThrow()
  })
})
