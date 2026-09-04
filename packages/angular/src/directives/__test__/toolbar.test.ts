import type { CalendarRange } from '@midstem/chronous'
import { Component, signal } from '@angular/core'
import { describe, expect, it } from 'vitest'

import { CALENDAR_DIRECTIVES } from '..'

import { EVENTS, LOCALE, WEEK } from './fixtures'
import { mount, oneOf, textOf } from './helpers'

@Component({
  selector: 'chronous-toolbar-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range(); events: events; locale: locale">
      <div
        *chronousToolbar="let navigation; let title = title"
        data-testid="toolbar"
      >
        <span data-testid="title">{{ title }}</span>

        <button
          type="button"
          data-testid="next"
          [disabled]="!navigation.next"
          (click)="range.set(navigation.next!)"
        ></button>

        <button
          type="button"
          data-testid="month"
          (click)="range.set(navigation.withView('month'))"
        ></button>
      </div>
    </div>
  `
})
class ToolbarHostComponent {
  readonly range = signal(WEEK)

  readonly events = EVENTS

  readonly locale = LOCALE
}

const BAD: CalendarRange = { ...WEEK, timeZone: 'Not/AZone' }

@Component({
  selector: 'chronous-error-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events; error: failed" class="shell">
      <div chronousHeader></div>
    </div>

    <ng-template #failed let-error>
      <p data-testid="failed">{{ error.name }}</p>
    </ng-template>
  `
})
class ErrorHostComponent {
  readonly range = BAD

  readonly events = EVENTS
}

@Component({
  selector: 'chronous-bare-host',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div *chronousCalendar="range; events: events">
      <div chronousHeader></div>
    </div>
  `
})
class BareHostComponent {
  readonly range = BAD

  readonly events = EVENTS
}

describe('the toolbar', () => {
  it('steps the range the engine handed it', () => {
    const fixture = mount(ToolbarHostComponent)

    oneOf(fixture, 'next').click()
    fixture.detectChanges()

    expect(fixture.componentInstance.range().currentDate).toBe('2026-03-25')
  })

  it('switches the view the calendar is showing', () => {
    const fixture = mount(ToolbarHostComponent)

    oneOf(fixture, 'month').click()
    fixture.detectChanges()

    expect(fixture.componentInstance.range().view).toBe('month')
  })

  it('titles the period the range is on', () => {
    const fixture = mount(ToolbarHostComponent)

    expect(textOf(oneOf(fixture, 'title'))).toBe('18 March 2026')
  })
})

describe('the root', () => {
  it('hands an unusable range to the template it was given', () => {
    const fixture = mount(ErrorHostComponent)

    expect(textOf(oneOf(fixture, 'failed'))).toBe('InvalidRangeError')
  })

  it('lets the error through when no template is given', () => {
    expect(() => mount(BareHostComponent)).toThrow()
  })
})
