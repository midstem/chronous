import type { Locator, Page } from '@playwright/test'

export type CalendarViewName = 'Day' | 'Week' | 'Month' | 'Agenda'

export class RegistryCalendarPage {
  readonly calendar: Locator
  readonly heading: Locator
  readonly caption: Locator
  readonly events: Locator
  readonly today: Locator

  constructor(readonly page: Page) {
    this.calendar = page.locator('[data-slot="chronous-calendar"]')
    this.heading = this.calendar.getByRole('heading', { level: 2 })
    this.caption = this.calendar.locator('[data-slot="calendar-toolbar"] p')
    this.events = this.calendar.locator('[data-slot="calendar-event"]')
    this.today = this.calendar.locator('[data-today="true"]')
  }

  async goto(params: Record<string, string> = {}): Promise<void> {
    await this.page.goto(`/?${new URLSearchParams(params).toString()}`)
    await this.heading.waitFor()
  }

  view(name: CalendarViewName): Locator {
    return this.calendar
      .getByRole('group', { name: 'Calendar view' })
      .getByRole('button', { name, exact: true })
  }

  async selectView(name: CalendarViewName): Promise<void> {
    await this.view(name).click()
  }

  button(name: 'Previous period' | 'Next period' | 'Today'): Locator {
    return this.calendar.getByRole('button', { name, exact: true })
  }

  region(name: string): Locator {
    return this.calendar.getByRole('region', { name, exact: true })
  }

  event(title: string): Locator {
    return this.events.filter({ hasText: title })
  }

  monthDay(date: string): Locator {
    return this.calendar.locator(
      `[data-date="${date}"][data-in-current-period]`
    )
  }

  async openTab(
    name: 'Preview' | 'Code' | 'Command' | 'Manual'
  ): Promise<void> {
    await this.page.getByRole('tab', { name, exact: true }).click()
  }
}
