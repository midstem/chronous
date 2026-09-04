import type { CalendarRange, EventInput } from '@midstem/chronous'
import { Component, input } from '@angular/core'
import type { ComponentFixture } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'

import { CALENDAR_DIRECTIVES } from '..'

import type { EventData } from './fixtures'
import { LOCALE, WEEK, ZONE } from './fixtures'
import { allOf, mount, oneOf, textOf } from './helpers'

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

@Component({
  selector: 'chronous-overflow-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events; locale: locale">
      <div chronousMonthGrid>
        <div *chronousMonthRows="let row; maxLanes: maxLanes()">
          <div
            *chronousMonthDays="
              row;
              let bars = bars;
              let hiddenBars = hiddenBars;
              let lanes = lanes
            "
          >
            <span data-testid="covering">{{ bars.length }}</span>
            <span data-testid="hidden">{{ hiddenBars.length }}</span>
            <span data-testid="lanes">{{ lanes }}</span>
          </div>

          <div *chronousMonthAllDayEvents="row" data-testid="bar"></div>
        </div>
      </div>
    </div>
  `
})
class OverflowHostComponent {
  readonly range = MONTH

  readonly events = STACKED

  readonly locale = LOCALE

  readonly maxLanes = input<number | null>(null)
}

@Component({
  selector: 'chronous-all-day-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events(); locale: locale">
      <chronous-all-day-row [minLanes]="minLanes()" data-testid="all-day">
        <span chronousGutterCell data-testid="gutter">all-day</span>
        <div *chronousAllDayEvents="let event" data-testid="bar"></div>
      </chronous-all-day-row>
    </div>
  `
})
class AllDayHostComponent {
  readonly range = WEEK

  readonly locale = LOCALE

  readonly events = input<EventInput<EventData>[]>(NO_ALL_DAY)

  readonly minLanes = input(0)
}

const withMaxLanes = (
  maxLanes: number | null
): ComponentFixture<OverflowHostComponent> => {
  const fixture = mount(OverflowHostComponent)

  fixture.componentRef.setInput('maxLanes', maxLanes)
  fixture.detectChanges()

  return fixture
}

describe('a month cell that overflows', () => {
  it('hands every bar covering the day to the cell', () => {
    const covering = allOf(withMaxLanes(null), 'covering').map(textOf)

    expect(covering).toContain('4')
    expect(covering.filter((count) => count !== '0')).toHaveLength(3)
  })

  it('hides nothing and reports no cut-off without maxLanes', () => {
    const fixture = withMaxLanes(null)

    expect(allOf(fixture, 'bar')).toHaveLength(STACKED.length)
    expect(
      allOf(fixture, 'hidden')
        .map(textOf)
        .every((it) => it === '0')
    ).toBe(true)
    expect(allOf(fixture, 'lanes').map(textOf)).toContain('4')
  })

  it('stops drawing bars past the cut-off', () => {
    expect(allOf(withMaxLanes(2), 'bar')).toHaveLength(2)
  })

  it('counts the bars it dropped, per day', () => {
    const fixture = withMaxLanes(2)

    expect(allOf(fixture, 'hidden').map(textOf)).toContain('2')
    expect(allOf(fixture, 'lanes').map(textOf)).toContain('2')
    expect(allOf(fixture, 'lanes').map(textOf)).not.toContain('4')
  })

  it('leaves a day the cut-off does not reach alone', () => {
    const fixture = withMaxLanes(4)

    expect(allOf(fixture, 'bar')).toHaveLength(STACKED.length)
    expect(
      allOf(fixture, 'hidden')
        .map(textOf)
        .every((it) => it === '0')
    ).toBe(true)
  })
})

describe('the all-day row with nothing in it', () => {
  it('collapses by default, as it always has', () => {
    const fixture = mount(AllDayHostComponent)

    expect(oneOf(fixture, 'all-day').getAttribute('style')).toContain(
      'display: none'
    )
  })

  it('holds its height when minLanes asks it to', () => {
    const fixture = mount(AllDayHostComponent)

    fixture.componentRef.setInput('minLanes', 1)
    fixture.detectChanges()

    const row = oneOf(fixture, 'all-day')

    expect(row.getAttribute('style')).toContain('display: grid')
    expect(textOf(oneOf(fixture, 'gutter'))).toBe('all-day')
    expect(allOf(fixture, 'bar')).toHaveLength(0)
    expect(row.innerHTML).toContain('height: 24px')
  })

  it('never shrinks a row that has more lanes than the minimum', () => {
    const fixture = mount(AllDayHostComponent)

    fixture.componentRef.setInput('minLanes', 1)
    fixture.componentRef.setInput('events', STACKED)
    fixture.detectChanges()

    expect(oneOf(fixture, 'all-day').innerHTML).toContain('height: 96px')
  })
})
