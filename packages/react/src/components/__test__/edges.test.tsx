import type { CalendarRange } from '@midstem/chronous'
import { render, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useNow } from '../slotted/use-now'
import { Calendar } from '../../index'
import { EVENTS, WEEK } from './fixtures'

const textOf = (element: HTMLElement): string => element.textContent ?? ''

const BROKEN_LOCALE = 'not a locale'

describe('a label the runtime cannot format', () => {
  it('falls back to the ISO value it was handed', () => {
    render(
      <Calendar.Root range={WEEK} events={EVENTS} locale={BROKEN_LOCALE}>
        <Calendar.Header>
          <Calendar.DayHeadings data-testid="heading" />
        </Calendar.Header>
        <Calendar.Toolbar onNavigate={vi.fn()} data-testid="toolbar" />
      </Calendar.Root>
    )

    expect(textOf(screen.getAllByTestId('heading')[0])).toContain('2026-03-16')
    expect(textOf(screen.getByTestId('toolbar'))).toContain('2026-03-18')
  })
})

describe('the toolbar', () => {
  const Toolbar = ({
    onNavigate,
    children
  }: {
    onNavigate: (range: CalendarRange) => void
    children?: ReactNode
  }): ReactNode => (
    <Calendar.Root range={WEEK} events={EVENTS}>
      <Calendar.Toolbar onNavigate={onNavigate} data-testid="toolbar">
        {children}
      </Calendar.Toolbar>
    </Calendar.Root>
  )

  it('steps back a period', () => {
    const onNavigate = vi.fn()

    render(<Toolbar onNavigate={onNavigate} />)

    screen.getByLabelText('Previous period').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ currentDate: '2026-03-11' })
    )
  })

  it('reads today off the clock at the click', () => {
    const onNavigate = vi.fn()

    render(<Toolbar onNavigate={onNavigate} />)

    screen.getByText('Today').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'week' })
    )
  })

  it('hands navigation over to a render prop', () => {
    const onNavigate = vi.fn()

    render(
      <Calendar.Root range={WEEK} events={EVENTS}>
        <Calendar.Toolbar onNavigate={onNavigate} data-testid="toolbar">
          {({ title, navigation, goTo }) => (
            <button
              type="button"
              onClick={() => {
                goTo(navigation.withView('day'))
              }}
            >
              {title}
            </button>
          )}
        </Calendar.Toolbar>
      </Calendar.Root>
    )

    screen.getByRole('button').click()

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'day' })
    )
  })
})

describe('the time grid', () => {
  it('leaves the scroll position alone when asked to', () => {
    render(
      <Calendar.Root range={WEEK} events={EVENTS}>
        <Calendar.TimeGrid scrollToHour={null} data-testid="grid">
          <Calendar.DayColumns />
        </Calendar.TimeGrid>
      </Calendar.Root>
    )

    expect(screen.getByTestId('grid').scrollTop).toBe(0)
  })
})

describe('useNow', () => {
  it('reports nothing when the zone cannot be read', () => {
    const { result } = renderHook(() => useNow('Not/AZone'))

    expect(result.current).toBeNull()
  })
})
