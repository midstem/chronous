import type { CalendarRange } from '@midstem/chronous'
import { screen } from '@testing-library/dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { VNode } from 'vue'
import { defineComponent, h } from 'vue'

import { useAgendaDayContext, useMonthDayContext } from '../context'
import { Calendar } from '../../index'
import { mount } from '../../test/helpers'
import { AGENDA, EVENTS, LOCALE, MONTH, WEEK, ZONE } from './fixtures'

const styleOf = (element: HTMLElement): string =>
  element.getAttribute('style') ?? ''

const textOf = (element: HTMLElement): string => element.textContent ?? ''

const textsOf = (id: string): string[] => {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)
  )
  return elements.map(textOf)
}

describe('the month view', () => {
  const Month = (): VNode =>
    h(
      Calendar.Root,
      { range: MONTH, events: EVENTS, locale: LOCALE },
      {
        default: () =>
          h(
            Calendar.MonthGrid,
            { 'data-testid': 'month' },
            {
              default: () => [
                h(Calendar.MonthWeekdays, { 'data-testid': 'weekday' }),
                h(
                  Calendar.MonthRows,
                  { 'data-testid': 'row' },
                  {
                    default: () => [
                      h(
                        Calendar.MonthDays,
                        { 'data-testid': 'day' },
                        {
                          default: ({ dayLabel, lanes }: any) => [
                            h('span', dayLabel),
                            h('span', { 'data-testid': 'lanes' }, lanes),
                            h(Calendar.MonthTimedEvents, {
                              'data-testid': 'entry'
                            })
                          ]
                        }
                      ),
                      h(Calendar.MonthAllDayEvents, { 'data-testid': 'bar' })
                    ]
                  }
                )
              ]
            }
          )
      }
    )

  it('lays a row out as its own grid of days', () => {
    mount(() => Month())

    expect(screen.getAllByTestId('weekday')).toHaveLength(7)
    expect(screen.getAllByTestId('row')).toHaveLength(6)
    expect(screen.getAllByTestId('day')).toHaveLength(42)
    expect(styleOf(screen.getAllByTestId('row')[0])).toContain(
      'grid-template-columns: repeat(7, minmax(0, 1fr))'
    )
  })

  it('offsets a bar past the day number and keeps it clickable', () => {
    mount(() => Month())

    const bar = screen.getByTestId('bar')

    expect(textOf(bar)).toBe('offsite')
    expect(styleOf(bar)).toContain('top: 28px')
    expect(styleOf(bar)).not.toContain('pointer-events: none')
  })

  it('tells a cell how many lanes the bars above it take', () => {
    mount(() => Month())

    const lanes = textsOf('lanes')

    expect(new Set(lanes)).toEqual(new Set(['0', '1']))
    expect(lanes.filter((count) => count === '1')).toHaveLength(7)
  })

  it('lists every timed event of a day in its cell', () => {
    mount(() => Month())

    expect(textsOf('entry')).toEqual(['standup', 'review'])
  })
})

describe('the agenda view', () => {
  const Agenda = ({
    showEmptyDays
  }: {
    showEmptyDays?: boolean
  } = {}): VNode =>
    h(
      Calendar.Root,
      { range: AGENDA, events: EVENTS, locale: LOCALE },
      {
        default: () =>
          h(
            Calendar.AgendaList,
            { 'data-testid': 'list' },
            {
              default: () =>
                h(
                  Calendar.AgendaDays,
                  { 'data-testid': 'day', showEmptyDays },
                  {
                    default: ({ monthLabel, dayLabel }: any) => [
                      h(
                        'span',
                        { 'data-testid': 'heading' },
                        `${dayLabel} ${monthLabel}`
                      ),
                      h(Calendar.AgendaAllDayEvents, { 'data-testid': 'bar' }),
                      h(Calendar.AgendaTimedEvents, { 'data-testid': 'box' })
                    ]
                  }
                )
            }
          )
      }
    )

  it('keeps only the days that carry something', () => {
    mount(() => Agenda())

    expect(screen.getAllByTestId('day')).toHaveLength(2)
    expect(screen.getAllByTestId('bar')).toHaveLength(2)
    expect(screen.getAllByTestId('box')).toHaveLength(2)
  })

  it('keeps the empty days when it is asked to', () => {
    mount(() => Agenda({ showEmptyDays: true }))

    expect(screen.getAllByTestId('day').length).toBeGreaterThan(2)
  })

  it('labels a timed event with the range it covers', () => {
    mount(() => Agenda())

    expect(textsOf('box')[0]).toBe('09:00 – 10:30')
  })

  it('names the month a floating date falls in', () => {
    mount(() => Agenda({ showEmptyDays: true }))

    expect(textsOf('heading')).toContain('1 Apr')
  })
})

describe('the now marker', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const DayAt = (): VNode =>
    h(
      Calendar.Root,
      {
        range: { view: 'day', currentDate: '2026-03-18', timeZone: ZONE },
        events: EVENTS
      },
      {
        default: () =>
          h(Calendar.TimeGrid, null, {
            default: () =>
              h(Calendar.DayColumns, null, {
                default: () => h(Calendar.NowMarker, { 'data-testid': 'now' })
              })
          })
      }
    )

  it('sits at the current minute of the day it belongs to', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T09:30:00+02:00'))

    mount(() => DayAt())

    expect(styleOf(screen.getByTestId('now'))).toContain('top: 39.58')
  })

  it('stays away from a day the clock is not on', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-19T09:30:00+02:00'))

    mount(() => DayAt())

    expect(screen.queryByTestId('now')).toBeNull()
  })
})

describe('the toolbar', () => {
  const Toolbar = ({
    onNavigate
  }: {
    onNavigate: (range: CalendarRange) => void
  }): VNode =>
    h(
      Calendar.Root,
      { range: WEEK, events: EVENTS, locale: LOCALE },
      {
        default: () =>
          h(Calendar.Toolbar, { onNavigate, views: ['week', 'month'] })
      }
    )

  it('steps the range the engine handed it', () => {
    const onNavigate = vi.fn()

    mount(() => Toolbar({ onNavigate }))

    screen.getByLabelText('Previous period')
    screen.getByLabelText('Next period').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ currentDate: '2026-03-25', view: 'week' })
    )
  })

  it('marks the view the calendar is showing', () => {
    mount(() => Toolbar({ onNavigate: vi.fn() }))

    expect(screen.getByText('week').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('month').getAttribute('aria-pressed')).toBe('false')
  })

  it('switches views when a view button is clicked', () => {
    const onNavigate = vi.fn()

    mount(() => Toolbar({ onNavigate }))

    screen.getByText('month').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'month' })
    )
  })

  it('formats month view title correctly', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: MONTH, events: EVENTS, locale: LOCALE },
        {
          default: () =>
            h(Calendar.Toolbar, { onNavigate: vi.fn(), views: ['month'] })
        }
      )
    )

    expect(screen.getByText('March 2026')).toBeDefined()
  })
})

describe('the root', () => {
  const BAD: CalendarRange = { ...WEEK, timeZone: 'Not/AZone' }

  it('hands an unusable range to the fallback it was given', () => {
    mount(() =>
      h(
        Calendar.Root,
        {
          range: BAD,
          events: EVENTS,
          renderError: (error) =>
            h('p', { 'data-testid': 'failed' }, error.name)
        },
        {
          default: () => h(Calendar.Header)
        }
      )
    )

    expect(textOf(screen.getByTestId('failed'))).toBe('InvalidRangeError')
  })

  it('renders an error using error slot', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: BAD, events: EVENTS },
        {
          error: (error: any) =>
            h('p', { 'data-testid': 'slot-failed' }, error.name)
        }
      )
    )

    expect(textOf(screen.getByTestId('slot-failed'))).toBe('InvalidRangeError')
  })

  it('keeps its own element around the fallback', () => {
    const { container } = mount(() =>
      h(
        Calendar.Root,
        {
          range: BAD,
          events: EVENTS,
          class: 'shell',
          renderError: () => h('p', 'failed')
        },
        {
          default: () => h(Calendar.Header)
        }
      )
    )

    expect(container.querySelector('.shell')?.textContent).toBe('failed')
  })

  it('lets the error through when no fallback is given', () => {
    expect(() =>
      mount(() =>
        h(
          Calendar.Root,
          { range: BAD, events: EVENTS },
          {
            default: () => h(Calendar.Header)
          }
        )
      )
    ).toThrow()
  })
})

describe('the header and all-day row gutterCell slot', () => {
  it('renders custom gutterCell slot', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS, locale: LOCALE },
        {
          default: () => [
            h(Calendar.Header, null, {
              gutterCell: () =>
                h('div', { 'data-testid': 'hdr-gutter' }, 'header-gutter')
            }),
            h(Calendar.AllDayRow, null, {
              gutterCell: () =>
                h('div', { 'data-testid': 'allday-gutter' }, 'allday-gutter'),
              default: () => h(Calendar.AllDayEvents)
            })
          ]
        }
      )
    )

    expect(textOf(screen.getByTestId('hdr-gutter'))).toBe('header-gutter')
    expect(textOf(screen.getByTestId('allday-gutter'))).toBe('allday-gutter')
  })
})

describe('context composables', () => {
  it('reads month day context', () => {
    let capturedDay: any
    let capturedBars: any
    let capturedHidden: any

    const InspectMonthDay = defineComponent({
      setup() {
        const ctx = useMonthDayContext()
        capturedDay = ctx.day.value
        capturedBars = ctx.bars.value
        capturedHidden = ctx.hiddenBars.value
        return () => h('div')
      }
    })

    mount(() =>
      h(
        Calendar.Root,
        { range: MONTH, events: EVENTS, locale: LOCALE },
        {
          default: () =>
            h(Calendar.MonthGrid, null, {
              default: () =>
                h(Calendar.MonthRows, null, {
                  default: () =>
                    h(Calendar.MonthDays, null, {
                      default: () => h(InspectMonthDay)
                    })
                })
            })
        }
      )
    )

    expect(capturedDay).toBeDefined()
    expect(capturedBars).toBeDefined()
    expect(capturedHidden).toBeDefined()
  })

  it('reads agenda day context', () => {
    let capturedDay: any

    const InspectAgendaDay = defineComponent({
      setup() {
        const ctx = useAgendaDayContext()
        capturedDay = ctx.day.value
        return () => h('div')
      }
    })

    mount(() =>
      h(
        Calendar.Root,
        { range: AGENDA, events: EVENTS, locale: LOCALE },
        {
          default: () =>
            h(Calendar.AgendaList, null, {
              default: () =>
                h(Calendar.AgendaDays, null, {
                  default: () => h(InspectAgendaDay)
                })
            })
        }
      )
    )

    expect(capturedDay).toBeDefined()
  })
})
