import type { CalendarRange } from '@midstem/chronous'
import { screen } from '@testing-library/dom'
import { describe, expect, it, vi } from 'vitest'
import type { VNode } from 'vue'
import { h } from 'vue'

import { Calendar } from '../../index'
import { mount } from '../../test/helpers'
import { useNow } from '../slotted/use-now'
import { EVENTS, WEEK } from './fixtures'

const textOf = (element: HTMLElement): string => element.textContent ?? ''

const BROKEN_LOCALE = 'not a locale' as any

describe('a label the runtime cannot format', () => {
  it('falls back to the ISO value it was handed', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS, locale: BROKEN_LOCALE },
        {
          default: () => [
            h(Calendar.Header, null, {
              default: () =>
                h(Calendar.DayHeadings, { 'data-testid': 'heading' })
            }),
            h(Calendar.Toolbar, {
              onNavigate: vi.fn(),
              'data-testid': 'toolbar'
            })
          ]
        }
      )
    )

    expect(textOf(screen.getAllByTestId('heading')[0])).toContain('2026-03-16')
    expect(textOf(screen.getByTestId('toolbar'))).toContain('2026-03-18')
  })
})

describe('the toolbar', () => {
  const Toolbar = ({
    onNavigate,
    slot
  }: {
    onNavigate: (range: CalendarRange) => void
    slot?: (scope: any) => VNode
  }): VNode =>
    h(
      Calendar.Root,
      { range: WEEK, events: EVENTS },
      {
        default: () =>
          h(
            Calendar.Toolbar,
            { onNavigate, 'data-testid': 'toolbar' },
            slot ? { default: slot } : undefined
          )
      }
    )

  it('steps back a period', () => {
    const onNavigate = vi.fn()

    mount(() => Toolbar({ onNavigate }))

    screen.getByLabelText('Previous period').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ currentDate: '2026-03-11' })
    )
  })

  it('reads today off the clock at the click', () => {
    const onNavigate = vi.fn()

    mount(() => Toolbar({ onNavigate }))

    screen.getByText('Today').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'week' })
    )
  })

  it('hands navigation over to a render prop', () => {
    const onNavigate = vi.fn()

    mount(() =>
      Toolbar({
        onNavigate,
        slot: ({ title, navigation, goTo }: any) =>
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                goTo(navigation.withView('day'))
              }
            },
            title
          )
      })
    )

    screen.getByRole('button').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'day' })
    )
  })
})

describe('the time grid', () => {
  it('leaves the scroll position alone when asked to', () => {
    mount(() =>
      h(
        Calendar.Root,
        { range: WEEK, events: EVENTS },
        {
          default: () =>
            h(
              Calendar.TimeGrid,
              { scrollToHour: null, 'data-testid': 'grid' },
              {
                default: () => h(Calendar.DayColumns)
              }
            )
        }
      )
    )

    expect(screen.getByTestId('grid').scrollTop).toBe(0)
  })
})

describe('useNow', () => {
  it('reports nothing when the zone cannot be read', () => {
    const now = useNow('Not/AZone')

    expect(now.value).toBeNull()
  })
})
