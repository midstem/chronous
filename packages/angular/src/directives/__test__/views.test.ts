import type { CalendarRange } from '@midstem/chronous'
import { Component, input } from '@angular/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CALENDAR_DIRECTIVES } from '..'

import { AGENDA, EVENTS, LOCALE, MONTH, ZONE } from './fixtures'
import { allOf, mount, oneOf, styleOf, textOf } from './helpers'

@Component({
  selector: 'chronous-month-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events; locale: locale">
      <div chronousMonthGrid data-testid="month">
        <div *chronousMonthWeekdays="let day" data-testid="weekday"></div>

        <div *chronousMonthRows="let row" data-testid="row">
          <div
            *chronousMonthDays="row; let day; let lanes = lanes"
            data-testid="day"
          >
            <span data-testid="lanes">{{ lanes }}</span>

            <span
              *chronousMonthTimedEvents="day; let event"
              data-testid="entry"
              >{{ event.id }}</span
            >
          </div>

          <div *chronousMonthAllDayEvents="row; let event" data-testid="bar">
            {{ event.id }}
          </div>
        </div>
      </div>
    </div>
  `
})
class MonthHostComponent {
  readonly range = MONTH

  readonly events = EVENTS

  readonly locale = LOCALE
}

@Component({
  selector: 'chronous-agenda-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events; locale: locale">
      <div chronousAgendaList data-testid="list">
        <div
          *chronousAgendaDays="
            let day;
            showEmptyDays: showEmptyDays();
            let bars = bars;
            let dayLabel = dayLabel;
            let monthLabel = monthLabel
          "
          data-testid="day"
        >
          <span data-testid="heading">{{ dayLabel }} {{ monthLabel }}</span>

          <span *chronousAgendaAllDayEvents="bars; let event" data-testid="bar">
            {{ event.id }}
          </span>

          <span
            *chronousAgendaTimedEvents="
              day;
              let event;
              let timeRangeLabel = timeRangeLabel
            "
            data-testid="box"
            >{{ timeRangeLabel }}</span
          >
        </div>
      </div>
    </div>
  `
})
class AgendaHostComponent {
  readonly range = AGENDA

  readonly events = EVENTS

  readonly locale = LOCALE

  readonly showEmptyDays = input(false)
}

@Component({
  selector: 'chronous-now-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events">
      <chronous-time-grid>
        <div *chronousDayColumns="let day">
          <div *chronousNowMarker="day" data-testid="now"></div>
        </div>
      </chronous-time-grid>
    </div>
  `
})
class NowHostComponent {
  readonly range: CalendarRange = {
    view: 'day',
    currentDate: '2026-03-18',
    timeZone: ZONE
  }

  readonly events = EVENTS
}

describe('the month view', () => {
  it('lays a row out as its own grid of days', () => {
    const fixture = mount(MonthHostComponent)

    expect(allOf(fixture, 'weekday')).toHaveLength(7)
    expect(allOf(fixture, 'row')).toHaveLength(6)
    expect(allOf(fixture, 'day')).toHaveLength(42)
    expect(styleOf(allOf(fixture, 'row')[0])).toContain(
      'grid-template-columns: repeat(7, minmax(0, 1fr))'
    )
  })

  it('offsets a bar past the day number', () => {
    const fixture = mount(MonthHostComponent)
    const bar = oneOf(fixture, 'bar')

    expect(textOf(bar)).toBe('offsite')
    expect(styleOf(bar)).toContain('top: 28px')
  })

  it('tells a cell how many lanes the bars above it take', () => {
    const fixture = mount(MonthHostComponent)
    const lanes = allOf(fixture, 'lanes').map(textOf)

    expect(new Set(lanes)).toEqual(new Set(['0', '1']))
    expect(lanes.filter((count) => count === '1')).toHaveLength(7)
  })

  it('lists every timed event of a day in its cell', () => {
    const fixture = mount(MonthHostComponent)

    expect(allOf(fixture, 'entry').map(textOf)).toEqual(['standup', 'review'])
  })
})

describe('the agenda view', () => {
  it('keeps only the days that carry something', () => {
    const fixture = mount(AgendaHostComponent)

    expect(allOf(fixture, 'day')).toHaveLength(2)
    expect(allOf(fixture, 'bar')).toHaveLength(2)
    expect(allOf(fixture, 'box')).toHaveLength(2)
  })

  it('keeps the empty days when it is asked to', () => {
    const fixture = mount(AgendaHostComponent)

    fixture.componentRef.setInput('showEmptyDays', true)
    fixture.detectChanges()

    expect(allOf(fixture, 'day').length).toBeGreaterThan(2)
  })

  it('labels a timed event with the range it covers', () => {
    const fixture = mount(AgendaHostComponent)

    expect(textOf(allOf(fixture, 'box')[0])).toBe('09:00 – 10:30')
  })

  it('names the month a floating date falls in', () => {
    const fixture = mount(AgendaHostComponent)

    fixture.componentRef.setInput('showEmptyDays', true)
    fixture.detectChanges()

    expect(allOf(fixture, 'heading').map(textOf)).toContain('1 Apr')
  })
})

describe('the now marker', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sits at the current minute of the day it belongs to', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T09:30:00+02:00'))

    const fixture = mount(NowHostComponent)

    fixture.detectChanges()

    expect(styleOf(oneOf(fixture, 'now'))).toContain('top: 39.58')
  })

  it('stays away from a day the clock is not on', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-19T09:30:00+02:00'))

    const fixture = mount(NowHostComponent)

    fixture.detectChanges()

    expect(allOf(fixture, 'now')).toHaveLength(0)
  })
})
