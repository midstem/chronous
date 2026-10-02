import { expect, type Locator, type Page } from '@playwright/test'

export class PlaygroundPage {
  readonly page: Page
  readonly heading: Locator
  readonly mastheadTag: Locator
  readonly calendarModeButton: Locator
  readonly codeModeButton: Locator
  readonly resetButton: Locator
  readonly title: Locator
  readonly viewGroup: Locator
  readonly activeViewButton: Locator
  readonly prevButton: Locator
  readonly nextButton: Locator
  readonly todayButton: Locator
  readonly densityGroup: Locator
  readonly inspector: Locator
  readonly inspectorSummary: Locator
  readonly inspectorJson: Locator
  readonly viewSelect: Locator
  readonly presetSelect: Locator
  readonly currentDateInput: Locator
  readonly styleSelect: Locator
  readonly weekStartsOnSelect: Locator
  readonly dayCountInput: Locator
  readonly slotMinutesInput: Locator
  readonly localeSelect: Locator
  readonly timeZoneSelect: Locator
  readonly disambiguationSelect: Locator
  readonly editor: Locator
  readonly alerts: Locator
  readonly codeSnippet: Locator
  readonly calendarDays: Locator
  readonly monthDays: Locator
  readonly agendaDays: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Chronous' })
    this.mastheadTag = page.locator('h1').getByText('playground')
    this.calendarModeButton = page.getByRole('button', {
      name: 'Calendar',
      exact: true
    })
    this.codeModeButton = page.getByRole('button', {
      name: 'Code',
      exact: true
    })
    this.resetButton = page.getByRole('button', {
      name: 'Reset',
      exact: true
    })
    this.title = page.locator('main header h2')
    this.viewGroup = page.locator('div[role="group"][aria-label="View"]')
    this.activeViewButton = page.locator(
      'div[role="group"][aria-label="View"] button[aria-pressed="true"]'
    )
    this.prevButton = page.getByRole('button', { name: 'Previous period' })
    this.nextButton = page.getByRole('button', { name: 'Next period' })
    this.todayButton = page.getByRole('button', { name: 'Today' })
    this.densityGroup = page.locator(
      'div[role="group"][aria-label="Row height"]'
    )
    this.inspector = page.locator('details').first()
    this.inspectorSummary = this.inspector.locator('summary')
    this.inspectorJson = this.inspector.locator('pre')
    this.viewSelect = page
      .getByLabel('view')
      .or(page.locator('select#field-view, select[data-field="view"]'))
      .first()
    this.presetSelect = page
      .getByLabel('preset')
      .or(page.locator('select#preset, select[data-field="preset"]'))
      .first()
    this.currentDateInput = page.getByLabel('currentDate')
    this.styleSelect = page.getByLabel('style')
    this.weekStartsOnSelect = page.getByLabel('weekStartsOn')
    this.dayCountInput = page.getByLabel('dayCount')
    this.slotMinutesInput = page.getByLabel('slotMinutes')
    this.localeSelect = page.getByLabel('locale common values')
    this.timeZoneSelect = page.getByLabel('timeZone common values')
    this.disambiguationSelect = page.getByLabel('disambiguation')
    this.editor = page.getByRole('textbox', { name: 'Events JSON' })
    this.alerts = page.locator('[role="alert"]')
    this.codeSnippet = page.locator('pre code, pre')
    this.calendarDays = page.locator('main [data-date]')
    this.monthDays = page.locator('[data-in-current-period="true"]')
    this.agendaDays = page.locator('main ul li[data-date]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/')
    await expect(this.heading).toBeVisible()
    await expect(this.title).toBeVisible()
  }

  async selectView(
    view: 'day' | 'week' | 'days' | 'month' | 'agenda'
  ): Promise<void> {
    const viewButton = this.viewGroup.getByRole('button', {
      name: view,
      exact: true
    })
    await viewButton.click()
    await expect(viewButton).toHaveAttribute('aria-pressed', 'true')
  }

  async getActiveView(): Promise<string> {
    await expect(this.activeViewButton).toBeVisible()
    return (await this.activeViewButton.innerText()).trim().toLowerCase()
  }

  async navigatePeriod(direction: 'prev' | 'next' | 'today'): Promise<void> {
    if (direction === 'prev') {
      await this.prevButton.click()
    } else if (direction === 'next') {
      await this.nextButton.click()
    } else {
      await this.todayButton.click()
    }
  }

  async selectPreset(preset: string): Promise<void> {
    await this.presetSelect.selectOption(preset)
    await expect(this.presetSelect).toHaveValue(preset)
  }

  densityButton(value: 'compact' | 'cosy' | 'roomy'): Locator {
    return this.densityGroup.locator(`button[title^="${value}"]`)
  }

  async selectDensity(density: 'compact' | 'cosy' | 'roomy'): Promise<void> {
    const button = this.densityButton(density)
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  }

  async switchMode(mode: 'Calendar' | 'Code'): Promise<void> {
    const button =
      mode === 'Calendar' ? this.calendarModeButton : this.codeModeButton
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  }

  async reset(): Promise<void> {
    await this.resetButton.click()
  }

  sidebarTab(tab: 'Options' | 'Events'): Locator {
    return this.page
      .getByRole('button', { name: tab, exact: true })
      .or(this.page.getByRole('tab', { name: tab, exact: true }))
      .first()
  }

  async switchSidebarTab(tab: 'Options' | 'Events'): Promise<void> {
    const tabButton = this.sidebarTab(tab)
    await tabButton.click()
    await expect(
      tab === 'Events' ? this.editor : this.presetSelect
    ).toBeVisible()
  }

  async editEventsJson(source: string): Promise<void> {
    await this.switchSidebarTab('Events')
    await this.editor.fill(source)
    await this.editor.dispatchEvent('input')
  }

  async setEvents(data: unknown): Promise<void> {
    await this.editEventsJson(JSON.stringify(data, null, 2))
  }

  async setCurrentDate(date: string): Promise<void> {
    await this.currentDateInput.fill(date)
    await this.currentDateInput.dispatchEvent('change')
    await this.currentDateInput.dispatchEvent('input')
  }

  async selectSidebarView(view: string): Promise<void> {
    await this.viewSelect.selectOption(view)
  }

  async selectStyle(style: string): Promise<void> {
    await this.styleSelect.selectOption(style)
  }

  async selectWeekStartsOn(value: string): Promise<void> {
    await this.weekStartsOnSelect.selectOption(value)
  }

  async setDayCount(count: number | string): Promise<void> {
    await this.dayCountInput.fill(String(count))
    await this.dayCountInput.dispatchEvent('input')
  }

  async setSlotMinutes(minutes: number | string): Promise<void> {
    await this.slotMinutesInput.fill(String(minutes))
    await this.slotMinutesInput.dispatchEvent('input')
  }

  async selectLocale(locale: string): Promise<void> {
    await this.localeSelect.selectOption(locale)
  }

  async selectTimeZone(timeZone: string): Promise<void> {
    await this.timeZoneSelect.selectOption(timeZone)
  }

  async selectDisambiguation(option: string): Promise<void> {
    await this.disambiguationSelect.selectOption(option)
  }

  openInspector(): Promise<void> {
    return this.inspectorSummary.click()
  }

  event(id: string): Locator {
    return this.page.locator(`[data-event-id="${id}"]`)
  }

  series(id: string, date?: string): Locator {
    const prefix = `${id}__`
    const root = date ? this.dayColumn(date) : this.page.locator('main')
    return root.locator(`[data-event-id^="${prefix}"]`)
  }

  dayHeading(date: string): Locator {
    return this.page.locator(`main [data-date="${date}"]`).first()
  }

  dayColumn(date: string): Locator {
    return this.page.locator(`main [data-date="${date}"]`).last()
  }

  eventInDay(date: string, id: string): Locator {
    return this.dayColumn(date).locator(`[data-event-id="${id}"]`)
  }

  eventsByTitle(title: string, date?: string): Locator {
    const root = date ? this.dayColumn(date) : this.page.locator('main')
    return root.getByText(title)
  }

  eventTitle(target: string | Locator): Locator {
    const root = typeof target === 'string' ? this.event(target) : target
    return root.locator('[title]').first()
  }

  allDayEvent(id: string): Locator {
    return this.page.locator(`.border-b [data-event-id="${id}"]`)
  }

  slots(date: string): Locator {
    return this.dayColumn(date).locator('span.border-t.border-hair')
  }

  metric(label: string): Locator {
    return this.page
      .locator('details summary span.flex.items-baseline')
      .filter({
        has: this.page.locator('span.text-faint', {
          hasText: new RegExp(`^${label}$`)
        })
      })
      .locator('span.font-mono')
  }
}
