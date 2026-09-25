import { screen } from '@testing-library/dom'
import { describe, expect, it, vi } from 'vitest'
import type { VNode } from 'vue'
import { h } from 'vue'

import { Calendar, createCalendarComponents } from '../../index'
import { mount } from '../../test/helpers'
import type { EventData } from './fixtures'
import { EVENTS, LOCALE, WEEK } from './fixtures'

const styleOf = (element: HTMLElement): string =>
  element.getAttribute('style') ?? ''

const textOf = (element: HTMLElement): string => element.textContent ?? ''

const Week = ({ gutterWidth }: { gutterWidth?: string } = {}): VNode =>
  h(
    Calendar.Root,
    {
      range: WEEK,
      events: EVENTS,
      locale: LOCALE,
      gutterWidth
    },
    {
      default: () => [
        h(
          Calendar.Header,
          { 'data-testid': 'header' },
          {
            default: () => h(Calendar.DayHeadings, { 'data-testid': 'heading' })
          }
        ),
        h(
          Calendar.AllDayRow,
          { 'data-testid': 'all-day', gutterCell: 'all-day' },
          {
            default: () => h(Calendar.AllDayEvents, { 'data-testid': 'bar' })
          }
        ),
        h(
          Calendar.TimeGrid,
          { 'data-testid': 'grid' },
          {
            default: () => [
              h(
                Calendar.TimeAxis,
                { 'data-testid': 'axis' },
                {
                  default: () =>
                    h(Calendar.TimeLabels, { 'data-testid': 'label' })
                }
              ),
              h(
                Calendar.DayColumns,
                { 'data-testid': 'column' },
                {
                  default: () => [
                    h(Calendar.TimeSlots, { 'data-testid': 'slot' }),
                    h(Calendar.TimedEvents, { 'data-testid': 'event' })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  )

describe('the slotted view', () => {
  it('renders a heading and a column for every day of the range', () => {
    mount(() => Week())

    expect(screen.getAllByTestId('heading')).toHaveLength(7)
    expect(screen.getAllByTestId('column')).toHaveLength(7)
  })

  it('labels a heading with the weekday and the day number by default', () => {
    mount(() => Week())

    expect(textOf(screen.getAllByTestId('heading')[0])).toBe('Mon 16')
  })

  it('draws a line and a gutter label for every slot of the day', () => {
    mount(() => Week())

    expect(screen.getAllByTestId('label')).toHaveLength(24)
    expect(screen.getAllByTestId('slot')).toHaveLength(24 * 7)
  })

  it('reads a gutter label off the slot rather than off the wall clock', () => {
    mount(() => Week())

    expect(textOf(screen.getAllByTestId('label')[0])).toBe('00:00')
    expect(textOf(screen.getAllByTestId('label')[9])).toBe('09:00')
  })

  it('places a timed event on the geometry the engine handed back', () => {
    mount(() => Week())

    const [standup, review] = screen.getAllByTestId('event')

    expect(textOf(standup)).toBe('standup')
    expect(styleOf(standup)).toContain('top: 37.5%')
    expect(styleOf(standup)).toContain('height: 6.25%')
    expect(styleOf(standup)).toContain('left: 0%')
    expect(styleOf(standup)).toContain('width: calc(50% - 3px)')
    expect(styleOf(review)).toContain('left: 50%')
  })

  it('spreads an all-day event across the days it covers', () => {
    mount(() => Week())

    const bar = screen.getByTestId('bar')

    expect(textOf(bar)).toBe('offsite')
    expect(styleOf(bar)).toContain('+ 2px')
    expect(styleOf(bar)).toContain('- 4px')
  })

  it('drops the all-day row when the range holds no all-day event', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: [] },
        {
          default: () =>
            h(
              Calendar.AllDayRow,
              { 'data-testid': 'all-day' },
              {
                default: () => h(Calendar.AllDayEvents)
              }
            )
        }
      )
    )

    expect(screen.queryByTestId('all-day')).toBeNull()
  })
})

describe('a component slot', () => {
  it('hands the scope to a render prop', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS, locale: LOCALE },
        {
          default: () =>
            h(Calendar.Header, null, {
              default: () =>
                h(
                  Calendar.DayHeadings,
                  { 'data-testid': 'heading' },
                  {
                    default: ({
                      weekdayLabel,
                      dayLabel,
                      inCurrentPeriod
                    }: any) =>
                      `${weekdayLabel}/${dayLabel}/${String(inCurrentPeriod)}`
                  }
                )
            })
        }
      )
    )

    expect(textOf(screen.getAllByTestId('heading')[0])).toBe('Mon/16/true')
  })

  it('accepts a plain node in place of a render prop', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS },
        {
          default: () =>
            h(Calendar.Header, null, {
              default: () =>
                h(
                  Calendar.DayHeadings,
                  { 'data-testid': 'heading' },
                  {
                    default: () => h('span', 'fixed')
                  }
                )
            })
        }
      )
    )

    expect(textOf(screen.getAllByTestId('heading')[0])).toBe('fixed')
  })
})

describe('the polymorphic surface', () => {
  it('renders the tag asked for and forwards its DOM props', () => {
    const onClick = vi.fn()

    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS },
        {
          default: () =>
            h(Calendar.TimeGrid, null, {
              default: () =>
                h(Calendar.DayColumns, null, {
                  default: () =>
                    h(Calendar.TimedEvents, {
                      as: 'button',
                      type: 'button',
                      onClick,
                      'data-testid': 'event'
                    })
                })
            })
        }
      )
    )

    const [standup] = screen.getAllByTestId('event')

    expect(standup.tagName).toBe('BUTTON')

    standup.click()

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('lets a consumer style win over the layout it computed', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS },
        {
          default: () =>
            h(Calendar.TimeGrid, null, {
              default: () =>
                h(Calendar.DayColumns, null, {
                  default: () =>
                    h(Calendar.TimedEvents, {
                      'data-testid': 'event',
                      style: { top: '10%', color: 'red' }
                    })
                })
            })
        }
      )
    )

    const [standup] = screen.getAllByTestId('event')

    expect(styleOf(standup)).toContain('top: 10%')
    expect(styleOf(standup)).toContain('color: red')
    expect(styleOf(standup)).toContain('height: 6.25%')
  })
})

describe('state a stylesheet can reach', () => {
  it('marks a day with its date and whether it is in the period', () => {
    mount(() => Week())

    const [first] = screen.getAllByTestId('heading')

    expect(first.getAttribute('data-date')).toBe('2026-03-16')
    expect(first.getAttribute('data-in-current-period')).toBe('true')
  })

  it('marks an event with its id and the edges it runs past', () => {
    mount(() => Week())

    const bar = screen.getByTestId('bar')

    expect(bar.getAttribute('data-event-id')).toBe('offsite')
    expect(bar.getAttribute('data-continues-before')).toBe('false')
  })

  it('lets a consumer prop win over the attribute it sets', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS },
        {
          default: () =>
            h(Calendar.Header, null, {
              default: () =>
                h(Calendar.DayHeadings, {
                  'data-testid': 'heading',
                  'data-date': 'pinned'
                })
            })
        }
      )
    )

    expect(screen.getAllByTestId('heading')[0].getAttribute('data-date')).toBe(
      'pinned'
    )
  })
})

describe('the gutter', () => {
  it('is read from the root so the three grids stay in step', () => {
    const { container } = mount(() => Week({ gutterWidth: '5rem' }))

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
    expect(() => mount(() => h(Calendar.TimedEvents))).toThrow(
      'DayColumnContext is only readable inside <Calendar.DayColumns>'
    )
  })
})

describe('createCalendarComponents', () => {
  it('carries the event data type into every render prop', () => {
    const Typed = createCalendarComponents<EventData>()

    mount(() =>
      h(
        Typed.Root,
        { range: WEEK, events: EVENTS },
        {
          default: () =>
            h(Typed.TimeGrid, null, {
              default: () =>
                h(Typed.DayColumns, null, {
                  default: () =>
                    h(
                      Typed.TimedEvents,
                      { 'data-testid': 'event' },
                      {
                        default: ({ event }: any) => event.data?.title
                      }
                    )
                })
            })
        }
      )
    )

    expect(textOf(screen.getAllByTestId('event')[0])).toBe('Standup')
  })
})
