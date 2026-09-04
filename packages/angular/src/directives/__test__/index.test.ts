import { Component, signal } from '@angular/core'
import { describe, expect, it } from 'vitest'

import { CALENDAR_DIRECTIVES } from '..'

import { EVENTS, LOCALE, WEEK } from './fixtures'
import { allOf, mount, oneOf, styleOf, textOf } from './helpers'

@Component({
  selector: 'chronous-week-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div
      *chronousCalendar="
        range();
        events: events();
        locale: locale;
        gutterWidth: gutterWidth()
      "
      data-testid="root"
    >
      <div chronousHeader data-testid="header">
        <div
          *chronousDayHeadings="
            let day;
            let weekdayLabel = weekdayLabel;
            let dayLabel = dayLabel
          "
          data-testid="heading"
        >
          {{ weekdayLabel }} {{ dayLabel }}
        </div>
      </div>

      <chronous-all-day-row data-testid="all-day">
        <span chronousGutterCell>all-day</span>
        <div *chronousAllDayEvents="let event" data-testid="bar">
          {{ event.id }}
        </div>
      </chronous-all-day-row>

      <chronous-time-grid data-testid="grid">
        <div chronousTimeAxis data-testid="axis">
          <div
            *chronousTimeLabels="let slot; let timeLabel = timeLabel"
            data-testid="label"
          >
            {{ timeLabel }}
          </div>
        </div>

        <div *chronousDayColumns="let day" data-testid="column">
          <span *chronousTimeSlots="day" data-testid="slot"></span>

          <div *chronousTimedEvents="day; let event" data-testid="event">
            {{ event.id }}
          </div>
        </div>
      </chronous-time-grid>
    </div>
  `
})
class WeekHostComponent {
  readonly range = signal(WEEK)

  readonly events = signal(EVENTS)

  readonly locale = LOCALE

  readonly gutterWidth = signal('4rem')
}

describe('the slotted view', () => {
  it('renders a heading and a column for every day of the range', () => {
    const fixture = mount(WeekHostComponent)

    expect(allOf(fixture, 'heading')).toHaveLength(7)
    expect(allOf(fixture, 'column')).toHaveLength(7)
  })

  it('labels a heading with the weekday and the day number', () => {
    const fixture = mount(WeekHostComponent)

    expect(textOf(allOf(fixture, 'heading')[0])).toBe('Mon 16')
  })

  it('draws a line and a gutter label for every slot of the day', () => {
    const fixture = mount(WeekHostComponent)

    expect(allOf(fixture, 'label')).toHaveLength(24)
    expect(allOf(fixture, 'slot')).toHaveLength(24 * 7)
  })

  it('reads a gutter label off the slot rather than off the wall clock', () => {
    const fixture = mount(WeekHostComponent)

    expect(textOf(allOf(fixture, 'label')[0])).toBe('00:00')
    expect(textOf(allOf(fixture, 'label')[9])).toBe('09:00')
  })

  it('places a timed event on the geometry the engine handed back', () => {
    const fixture = mount(WeekHostComponent)
    const [standup, review] = allOf(fixture, 'event')

    expect(textOf(standup)).toBe('standup')
    expect(styleOf(standup)).toContain('top: 37.5%')
    expect(styleOf(standup)).toContain('height: 6.25%')
    expect(styleOf(standup)).toContain('left: 0%')
    expect(styleOf(standup)).toContain('width: calc(50% - 3px)')
    expect(styleOf(review)).toContain('left: 50%')
  })

  it('spans an all-day event across the days it covers', () => {
    const fixture = mount(WeekHostComponent)
    const [offsite] = allOf(fixture, 'bar')

    expect(offsite.getAttribute('data-event-id')).toBe('offsite')
    expect(styleOf(offsite)).toContain('left: calc(14.2857% + 2px)')
    expect(styleOf(offsite)).toContain('width: calc(42.8571% - 4px)')
  })

  it('lays the header out on the gutter width it was given', () => {
    const fixture = mount(WeekHostComponent)

    expect(styleOf(oneOf(fixture, 'header'))).toContain(
      'grid-template-columns: 4rem repeat(7, minmax(0, 1fr))'
    )
  })
})
