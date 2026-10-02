import type { ViewKind } from '@midstem/chronous'
import {
  DATE_HINT,
  DAY_COUNT_HINT,
  DEFAULT_TAB,
  DISAMBIGUATION_HINT,
  DISAMBIGUATION_OPTIONS,
  EVENTS_HINT,
  LOCALE_HINT,
  LOCALE_OPTIONS,
  PRESET_HINT,
  PRESET_OPTIONS,
  ROWS,
  SLOT_MINUTES_HINT,
  STYLE_HINT,
  STYLE_OPTIONS,
  TABS,
  TIME_ZONE_HINT,
  UNSET,
  VIEW_HINT,
  VIEW_OPTIONS,
  WEEK_STARTS_ON_HINT,
  WEEK_STARTS_ON_OPTIONS,
  ZONES,
  presetOf
} from '@midstem/playground-core'
import type { PresetId, Style, TabId } from '@midstem/playground-core'

import type { PlaygroundStore } from '../playground'

const renderPanel = (title: string, badge: string, content: string): string => `
  <section class="panel">
    <header class="panel-header">
      <h2 class="panel-title">${title}</h2>
      <span class="panel-badge">${badge}</span>
    </header>
    <div class="panel-body">
      ${content}
    </div>
  </section>
`

export const createSidebar = (store: PlaygroundStore): HTMLElement => {
  const aside = document.createElement('aside')
  aside.className = 'flex min-h-0 flex-col border-r border-line bg-raised'

  let activeTab: TabId = DEFAULT_TAB

  const render = (): void => {
    const state = store.getState()
    const events = store.getEvents()
    const source = store.getSource()
    const problem = store.getProblem()
    const preset = presetOf(state.preset)

    aside.innerHTML = `
      <div class="flex shrink-0 gap-0.5 border-b border-line px-2 pt-2" role="tablist">
        ${TABS.map(
          ({ id, label }) => `
          <button
            type="button"
            data-tab="${id}"
            role="tab"
            aria-selected="${id === activeTab}"
            aria-pressed="${id === activeTab}"
            class="rounded-t-md border-b-2 px-3 py-2 text-[13px] font-medium ${
              id === activeTab
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-ink'
            }"
          >
            ${label}
          </button>`
        ).join('')}
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-3">
        ${
          activeTab === 'range'
            ? `
          <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto" data-controls>
            ${renderPanel(
              'Appearance',
              'playground',
              `
              <div class="field-frame">
                <span class="sr-only">style</span>
                <select class="field-control" data-field="style" aria-label="style">
                  ${STYLE_OPTIONS.map(
                    (opt) =>
                      `<option value="${opt.value}" ${opt.value === state.style ? 'selected' : ''}>${opt.label}</option>`
                  ).join('')}
                </select>
                <span class="field-hint">${STYLE_HINT}</span>
              </div>
            `
            )}

            ${renderPanel(
              'Event examples',
              'loads sample data',
              `
              <div class="field-frame">
                <label class="field-label" for="field-preset">preset</label>
                <select id="field-preset" class="field-control" data-field="preset">
                  ${PRESET_OPTIONS.map(
                    (opt) =>
                      `<option value="${opt.value}" ${opt.value === state.preset ? 'selected' : ''}>${opt.label}</option>`
                  ).join('')}
                </select>
                <span class="field-hint">${PRESET_HINT}</span>
              </div>
            `
            )}

            ${renderPanel(
              'Calendar options',
              'buildCalendar range',
              `
              <div class="field-frame">
                <label class="field-label" for="field-view">view</label>
                <select id="field-view" class="field-control" data-field="view">
                  ${VIEW_OPTIONS.map(
                    (opt) =>
                      `<option value="${opt.value}" ${opt.value === state.view ? 'selected' : ''}>${opt.label}</option>`
                  ).join('')}
                </select>
                <span class="field-hint">${VIEW_HINT}</span>
              </div>

              <div class="field-frame">
                <label class="field-label" for="field-current-date">currentDate</label>
                <input
                  id="field-current-date"
                  type="date"
                  class="field-control"
                  data-field="currentDate"
                  value="${state.currentDate}"
                />
                <span class="field-hint">${DATE_HINT}</span>
              </div>

              <div class="field-frame">
                <label class="field-label" for="field-timezone">timeZone</label>
                <input
                  id="field-timezone"
                  list="zones-list"
                  type="text"
                  class="field-control"
                  data-field="timeZone"
                  value="${state.timeZone}"
                />
                <datalist id="zones-list">
                  ${ZONES.map((z) => `<option value="${z}"></option>`).join('')}
                </datalist>
                <span class="field-hint">${TIME_ZONE_HINT}</span>
              </div>

              <div class="field-frame">
                <label class="field-label" for="field-week-starts-on">weekStartsOn</label>
                <select id="field-week-starts-on" class="field-control" data-field="weekStartsOn">
                  ${WEEK_STARTS_ON_OPTIONS.map(
                    (opt) =>
                      `<option value="${opt.value}" ${opt.value === String(state.weekStartsOn) ? 'selected' : ''}>${opt.label}</option>`
                  ).join('')}
                </select>
                <span class="field-hint">${WEEK_STARTS_ON_HINT}</span>
              </div>

              <div class="field-frame">
                <label class="field-label" for="field-day-count">dayCount</label>
                <input
                  id="field-day-count"
                  type="number"
                  class="field-control"
                  data-field="dayCount"
                  placeholder="unset"
                  value="${state.dayCount === UNSET ? '' : state.dayCount}"
                />
                <span class="field-hint">${DAY_COUNT_HINT}</span>
              </div>

              <div class="field-frame">
                <label class="field-label" for="field-slot-minutes">slotMinutes</label>
                <input
                  id="field-slot-minutes"
                  type="number"
                  class="field-control"
                  data-field="slotMinutes"
                  placeholder="unset"
                  value="${state.slotMinutes === UNSET ? '' : state.slotMinutes}"
                />
                <span class="field-hint">${SLOT_MINUTES_HINT}</span>
              </div>

              <div class="field-frame">
                <label class="field-label" for="field-disambiguation">disambiguation</label>
                <select id="field-disambiguation" class="field-control" data-field="disambiguation">
                  ${DISAMBIGUATION_OPTIONS.map(
                    (opt) =>
                      `<option value="${opt.value}" ${opt.value === state.disambiguation ? 'selected' : ''}>${opt.label}</option>`
                  ).join('')}
                </select>
                <span class="field-hint">${DISAMBIGUATION_HINT}</span>
              </div>
            `
            )}

            ${renderPanel(
              'Language and labels',
              'playground',
              `
              <div class="field-frame">
                <label class="field-label" for="field-locale">locale</label>
                <input
                  id="field-locale"
                  list="locales-list"
                  type="text"
                  class="field-control"
                  data-field="locale"
                  value="${state.locale}"
                />
                <datalist id="locales-list">
                  ${LOCALE_OPTIONS.map(
                    (opt) =>
                      `<option value="${opt.value}">${opt.label}</option>`
                  ).join('')}
                </datalist>
                <span class="field-hint">${LOCALE_HINT}</span>
              </div>
            `
            )}
          </div>`
            : `
          <div class="flex min-h-0 flex-1 flex-col gap-2">
            <p class="text-[11px] leading-4 text-muted">${preset.hint}</p>
            <p class="font-mono text-[10px] text-faint">
              Events JSON · ${events.length} on the calendar
            </p>
            <textarea
              class="field-control min-h-0 flex-1 resize-none font-mono text-[11px] leading-5 ${problem ? 'border-danger' : ''}"
              aria-label="Events JSON"
              spellcheck="false"
              rows="${ROWS}"
              data-events-textarea
            >${source}</textarea>
            ${
              problem
                ? `<p role="alert" class="text-[11px] leading-4 text-danger">${problem}</p>`
                : `<p class="text-[11px] leading-4 text-muted">${EVENTS_HINT}</p>`
            }
          </div>`
        }
      </div>
    `

    // Tab buttons click listeners
    aside
      .querySelectorAll<HTMLButtonElement>('button[data-tab]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTab = btn.dataset.tab as TabId
          render()
        })
      })

    if (activeTab === 'range') {
      const styleSelect = aside.querySelector<HTMLSelectElement>(
        '[data-field="style"]'
      )
      styleSelect?.addEventListener('change', () => {
        store.update({ style: styleSelect.value as Style })
      })

      const presetSelect = aside.querySelector<HTMLSelectElement>(
        '[data-field="preset"]'
      )
      presetSelect?.addEventListener('change', () => {
        store.choosePreset(presetSelect.value as PresetId)
      })

      const viewSelect = aside.querySelector<HTMLSelectElement>(
        '[data-field="view"]'
      )
      viewSelect?.addEventListener('change', () => {
        store.update({ view: viewSelect.value as ViewKind })
      })

      const dateInput = aside.querySelector<HTMLInputElement>(
        '[data-field="currentDate"]'
      )
      dateInput?.addEventListener('input', () => {
        if (dateInput.value) {
          store.update({ currentDate: dateInput.value })
        }
      })

      const timeZoneInput = aside.querySelector<HTMLInputElement>(
        '[data-field="timeZone"]'
      )
      timeZoneInput?.addEventListener('change', () => {
        store.update({ timeZone: timeZoneInput.value })
      })

      const weekStartsOnSelect = aside.querySelector<HTMLSelectElement>(
        '[data-field="weekStartsOn"]'
      )
      weekStartsOnSelect?.addEventListener('change', () => {
        store.update({ weekStartsOn: weekStartsOnSelect.value })
      })

      const dayCountInput = aside.querySelector<HTMLInputElement>(
        '[data-field="dayCount"]'
      )
      dayCountInput?.addEventListener('input', () => {
        store.update({ dayCount: dayCountInput.value.trim() })
      })

      const slotMinutesInput = aside.querySelector<HTMLInputElement>(
        '[data-field="slotMinutes"]'
      )
      slotMinutesInput?.addEventListener('input', () => {
        store.update({ slotMinutes: slotMinutesInput.value.trim() })
      })

      const disambiguationSelect = aside.querySelector<HTMLSelectElement>(
        '[data-field="disambiguation"]'
      )
      disambiguationSelect?.addEventListener('change', () => {
        store.update({ disambiguation: disambiguationSelect.value })
      })

      const localeInput = aside.querySelector<HTMLInputElement>(
        '[data-field="locale"]'
      )
      localeInput?.addEventListener('change', () => {
        store.update({ locale: localeInput.value })
      })
    } else {
      const textarea = aside.querySelector<HTMLTextAreaElement>(
        '[data-events-textarea]'
      )
      textarea?.addEventListener('input', () => {
        store.changeSource(textarea.value)
      })
    }
  }

  render()
  store.subscribe(render)

  return aside
}
