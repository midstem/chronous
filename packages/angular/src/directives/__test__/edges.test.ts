import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'

import { injectNow } from '../../now'
import { CALENDAR_DIRECTIVES } from '..'

import { EVENTS, WEEK } from './fixtures'
import { allOf, mount, oneOf, textOf } from './helpers'

const BROKEN_LOCALE = 'not a locale'

@Component({
  selector: 'chronous-labels-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events; locale: locale">
      <div chronousHeader>
        <div
          *chronousDayHeadings="let day; let dayLabel = dayLabel"
          data-testid="heading"
        >
          {{ dayLabel }}
        </div>
      </div>

      <div
        *chronousToolbar="let navigation; let title = title"
        data-testid="title"
      >
        {{ title }}
      </div>
    </div>
  `
})
class LabelsHostComponent {
  readonly range = WEEK

  readonly events = EVENTS

  readonly locale = BROKEN_LOCALE
}

@Component({
  selector: 'chronous-still-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events">
      <chronous-time-grid [scrollToHour]="null" data-testid="grid">
        <div *chronousDayColumns="let day"></div>
      </chronous-time-grid>
    </div>
  `
})
class StillHostComponent {
  readonly range = WEEK

  readonly events = EVENTS
}

@Component({
  selector: 'chronous-orphan-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `<div chronousHeader></div>`
})
class OrphanHostComponent {}

@Component({
  selector: 'chronous-stray-axis-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events">
      <div chronousTimeAxis></div>
    </div>
  `
})
class StrayAxisHostComponent {
  readonly range = WEEK

  readonly events = EVENTS
}

describe('a label the runtime cannot format', () => {
  it('falls back to the ISO value it was handed', () => {
    const fixture = mount(LabelsHostComponent)

    expect(textOf(allOf(fixture, 'heading')[0])).toContain('2026-03-16')
    expect(textOf(oneOf(fixture, 'title'))).toContain('2026-03-18')
  })
})

describe('the time grid', () => {
  it('leaves the scroll position alone when asked to', () => {
    const fixture = mount(StillHostComponent)

    expect(oneOf(fixture, 'grid').scrollTop).toBe(0)
  })
})

describe('a part outside the calendar it reads', () => {
  it('says which parent it belongs under', () => {
    expect(() => mount(OrphanHostComponent)).toThrow(
      /CalendarContext is only readable inside/
    )
  })
})

describe('injectNow', () => {
  it('reports nothing when the zone cannot be read', () => {
    const now = TestBed.runInInjectionContext(() =>
      injectNow(() => 'Not/AZone')
    )

    expect(now()).toBeNull()
  })

  it('reports nothing before the first render', () => {
    const zone = signal('Europe/Kyiv')
    const now = TestBed.runInInjectionContext(() => injectNow(zone))

    expect(now()).toBeNull()
  })
})

describe('a part outside the time grid it reads', () => {
  it('names the grid it belongs under', () => {
    expect(() => mount(StrayAxisHostComponent)).toThrow(
      /TimeGridContext is only readable inside/
    )
  })
})
