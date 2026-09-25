import type { CalendarRange, EventInput } from '@midstem/chronous'
import { screen } from '@testing-library/dom'
import { describe, expect, it } from 'vitest'
import type { VNode } from 'vue'
import { h } from 'vue'

import { Calendar } from '../../index'
import { mount } from '../../test/helpers'
import type { EventData } from './fixtures'
import { LOCALE, WEEK, ZONE } from './fixtures'

const MONTH: CalendarRange = {
  view: 'month',
  currentDate: '2026-03-18',
  timeZone: ZONE
}

const STACKED: EventInput<EventData>[] = [
  { id: 'a', start: '2026-03-17', end: '2026-03-20', data: { title: 'A' } },
  { id: 'b', start: '2026-03-17', end: '2026-03-19', data: { title: 'B' } },
  { id: 'c', start: '2026-03-18', end: '2026-03-20', data: { title: 'C' } },
  { id: 'd', start: '2026-03-18', end: '2026-03-19', data: { title: 'D' } }
]

const NO_ALL_DAY: EventInput<EventData>[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00:00',
    end: '2026-03-18T09:30:00',
    data: { title: 'Standup' }
  }
]

const textsOf = (id: string): string[] => {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)
  )
  return elements.map((node) => node.textContent ?? '')
}

const Month = ({ maxLanes }: { maxLanes?: number | null } = {}): VNode =>
  h(
    Calendar.Root,
    { range: MONTH, events: STACKED, locale: LOCALE },
    {
      default: () =>
        h(Calendar.MonthGrid, null, {
          default: () =>
            h(
              Calendar.MonthRows,
              { maxLanes },
              {
                default: () => [
                  h(Calendar.MonthDays, null, {
                    default: ({ dayLabel, bars, hiddenBars, lanes }: any) => [
                      h('span', dayLabel),
                      h('span', { 'data-testid': 'covering' }, bars.length),
                      h('span', { 'data-testid': 'hidden' }, hiddenBars.length),
                      h('span', { 'data-testid': 'lanes' }, lanes)
                    ]
                  }),
                  h(Calendar.MonthAllDayEvents, { 'data-testid': 'bar' })
                ]
              }
            )
        })
    }
  )

describe('a month cell that overflows', () => {
  it('hands every bar covering the day to the cell', () => {
    mount(() => Month())

    const covering = textsOf('covering')

    expect(covering).toContain('4')
    expect(covering.filter((count) => count !== '0')).toHaveLength(3)
  })

  it('hides nothing and reports no cut-off without maxLanes', () => {
    mount(() => Month())

    expect(screen.getAllByTestId('bar')).toHaveLength(STACKED.length)
    expect(textsOf('hidden').every((count) => count === '0')).toBe(true)
    expect(textsOf('lanes')).toContain('4')
  })

  it('stops drawing bars past the cut-off', () => {
    mount(() => Month({ maxLanes: 2 }))

    expect(screen.getAllByTestId('bar')).toHaveLength(2)
  })

  it('counts the bars it dropped, per day', () => {
    mount(() => Month({ maxLanes: 2 }))

    expect(textsOf('hidden')).toContain('2')
    expect(textsOf('lanes')).toContain('2')
    expect(textsOf('lanes')).not.toContain('4')
  })

  it('leaves a day the cut-off does not reach alone', () => {
    mount(() => Month({ maxLanes: 4 }))

    expect(screen.getAllByTestId('bar')).toHaveLength(STACKED.length)
    expect(textsOf('hidden').every((count) => count === '0')).toBe(true)
  })
})

const Week = ({ minLanes }: { minLanes?: number } = {}): VNode =>
  h(
    Calendar.Root,
    { range: WEEK, events: NO_ALL_DAY, locale: LOCALE },
    {
      default: () =>
        h(
          Calendar.AllDayRow,
          {
            'data-testid': 'all-day',
            minLanes,
            gutterCell: h('span', 'all-day')
          },
          {
            default: () => h(Calendar.AllDayEvents, { 'data-testid': 'bar' })
          }
        )
    }
  )

describe('the all-day row with nothing in it', () => {
  it('collapses by default, as it always has', () => {
    mount(() => Week())

    expect(screen.queryByTestId('all-day')).toBeNull()
  })

  it('holds its height when minLanes asks it to', () => {
    mount(() => Week({ minLanes: 1 }))

    const row = screen.getByTestId('all-day')

    expect(row).not.toBeNull()
    expect(screen.getByText('all-day')).not.toBeNull()
    expect(screen.queryAllByTestId('bar')).toHaveLength(0)
    expect(row.innerHTML).toContain('height: 24px')
  })

  it('never shrinks a row that has more lanes than the minimum', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: STACKED, locale: LOCALE },
        {
          default: () =>
            h(
              Calendar.AllDayRow,
              { 'data-testid': 'all-day', minLanes: 1 },
              {
                default: () =>
                  h(Calendar.AllDayEvents, { 'data-testid': 'bar' })
              }
            )
        }
      )
    )

    expect(screen.getByTestId('all-day').innerHTML).toContain('height: 96px')
  })
})
