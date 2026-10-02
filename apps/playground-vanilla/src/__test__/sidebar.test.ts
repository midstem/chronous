// @vitest-environment jsdom
import 'temporal-polyfill/global'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createBoard } from '../board'
import { createPlaygroundStore } from '../playground'
import { createSidebar } from '../sidebar'
import { escapeHtml } from '../views/helpers'

afterEach(() => {
  document.body.replaceChildren()
  vi.useRealTimers()
})

describe('Vanilla playground controls', () => {
  it('offers common time zones and preserves custom input focus and caret', () => {
    const store = createPlaygroundStore()
    const sidebar = createSidebar(store)
    document.body.append(sidebar)

    const zoneSelect = sidebar.querySelector<HTMLSelectElement>(
      '[data-choice="timeZone"]'
    )
    expect(zoneSelect).not.toBeNull()
    expect(zoneSelect?.options[0]?.value).toBe('Europe/Kyiv')

    if (!zoneSelect) throw new Error('timeZone selector was not rendered')
    zoneSelect.focus()
    zoneSelect.value = 'UTC'
    zoneSelect.dispatchEvent(new Event('change', { bubbles: true }))
    const commonZoneSelect = sidebar.querySelector<HTMLSelectElement>(
      '[data-choice="timeZone"]'
    )
    expect(store.getState().timeZone).toBe('UTC')
    expect(document.activeElement).toBe(commonZoneSelect)

    if (!commonZoneSelect)
      throw new Error('timeZone selector was not rerendered')
    commonZoneSelect.value = '__custom__'
    commonZoneSelect.dispatchEvent(new Event('change', { bubbles: true }))

    const input = sidebar.querySelector<HTMLInputElement>(
      '[data-custom-field="timeZone"]'
    )
    expect(input).not.toBeNull()
    if (!input) throw new Error('custom timeZone input was not rendered')

    input.focus()
    input.value = 'America/New_York'
    input.setSelectionRange(8, 8)
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const rerenderedInput = sidebar.querySelector<HTMLInputElement>(
      '[data-custom-field="timeZone"]'
    )
    expect(store.getState().timeZone).toBe('America/New_York')
    expect(document.activeElement).toBe(rerenderedInput)
    expect(rerenderedInput?.selectionStart).toBe(8)

    store.choosePreset('showcase')
    expect(
      sidebar.querySelector<HTMLSelectElement>('[data-choice="timeZone"]')
        ?.value
    ).toBe(store.getState().timeZone)
    expect(
      sidebar.querySelector<HTMLInputElement>('[data-custom-field="timeZone"]')
    ).toBeNull()
  })

  it('shows unsafe JSON literally in the editor and event title', () => {
    const store = createPlaygroundStore()
    const sidebar = createSidebar(store)
    document.body.append(sidebar)
    sidebar.querySelector<HTMLButtonElement>('[data-tab="events"]')?.click()

    const title = '</textarea><img src=x onerror=alert(1)>'
    const source = JSON.stringify([
      {
        id: 'event-<img>',
        start: '2026-03-24T09:00:00',
        end: '2026-03-24T10:00:00',
        data: { title }
      }
    ])
    const textarea = sidebar.querySelector<HTMLTextAreaElement>(
      '[data-events-textarea]'
    )
    if (!textarea) throw new Error('event editor was not rendered')
    textarea.focus()
    textarea.value = source
    textarea.setSelectionRange(12, 12)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    const rerenderedTextarea = sidebar.querySelector<HTMLTextAreaElement>(
      '[data-events-textarea]'
    )
    expect(rerenderedTextarea?.value).toBe(source)
    expect(document.activeElement).toBe(rerenderedTextarea)
    expect(rerenderedTextarea?.selectionStart).toBe(12)
    expect(sidebar.querySelector('img')).toBeNull()

    const board = createBoard(store).element
    const rendered = board.textContent ?? ''
    expect(rendered).toContain(title)
    expect(board.querySelector('img')).toBeNull()
    expect(escapeHtml(title)).toContain('&lt;img')
  })

  it('renders the locale selector and resets a custom locale with a preset', () => {
    const store = createPlaygroundStore()
    const sidebar = createSidebar(store)
    document.body.append(sidebar)

    const localeSelect = sidebar.querySelector<HTMLSelectElement>(
      '[data-choice="locale"]'
    )
    expect(localeSelect?.options[0]?.value).toBe('en-GB')
    if (!localeSelect) throw new Error('locale selector was not rendered')
    localeSelect.focus()
    localeSelect.value = 'de-DE'
    localeSelect.dispatchEvent(new Event('change', { bubbles: true }))
    expect(document.activeElement).toBe(
      sidebar.querySelector('[data-choice="locale"]')
    )
    const commonLocaleSelect = sidebar.querySelector<HTMLSelectElement>(
      '[data-choice="locale"]'
    )
    if (!commonLocaleSelect)
      throw new Error('locale selector was not rerendered')
    commonLocaleSelect.value = '__custom__'
    commonLocaleSelect.dispatchEvent(new Event('change', { bubbles: true }))
    const localeInput = sidebar.querySelector<HTMLInputElement>(
      '[data-custom-field="locale"]'
    )
    if (!localeInput) throw new Error('custom locale input was not rendered')
    localeInput.value = 'fr-FR'
    localeInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(
      sidebar.querySelector<HTMLInputElement>('[data-custom-field="locale"]')
        ?.value
    ).toBe('fr-FR')

    store.reset()
    expect(
      sidebar.querySelector<HTMLSelectElement>('[data-choice="locale"]')?.value
    ).toBe('en-GB')
    expect(
      sidebar.querySelector<HTMLInputElement>('[data-custom-field="locale"]')
    ).toBeNull()
  })

  it('keeps the date field usable when its value changes', () => {
    const store = createPlaygroundStore()
    const sidebar = createSidebar(store)
    document.body.append(sidebar)
    const date = sidebar.querySelector<HTMLInputElement>(
      '[data-field="currentDate"]'
    )
    if (!date) throw new Error('currentDate field was not rendered')

    date.focus()
    date.value = '2026-03-26'
    date.dispatchEvent(new Event('input', { bubbles: true }))

    expect(store.getState().currentDate).toBe('2026-03-26')
    expect(document.activeElement).toBe(
      sidebar.querySelector('[data-field="currentDate"]')
    )
  })

  it('keeps invalid custom locale and time zone errors inside the board', () => {
    const store = createPlaygroundStore()
    const board = createBoard(store).element
    expect(() => store.update({ locale: 'not a locale' })).not.toThrow()
    expect(board.querySelector('[role="alert"]')).toBeNull()
    expect(board.textContent).toContain('2026-03')

    expect(() =>
      store.update({ locale: 'en-GB', timeZone: 'Not/A_Zone' })
    ).not.toThrow()
    expect(board.querySelector('[role="alert"]')).not.toBeNull()
  })

  it('matches the reference all-day row defaults for full and simple views', () => {
    const store = createPlaygroundStore()
    store.choosePreset('empty')
    const board = createBoard(store).element

    expect(board.textContent).toContain('all-day')

    store.update({ style: 'simple' })
    expect(board.textContent).not.toContain('all-day')
  })

  it('keeps the calendar scroll position and open state inspector on ordinary updates', () => {
    const store = createPlaygroundStore()
    const board = createBoard(store).element
    const initialScroller = board.querySelector<HTMLElement>('[data-scroller]')
    const initialInspector = board.querySelector<HTMLDetailsElement>('details')
    if (!initialScroller || !initialInspector)
      throw new Error('calendar board was not rendered')

    initialScroller.scrollTop = 420
    initialInspector.open = true
    store.update({ locale: 'uk-UA' })

    expect(board.querySelector<HTMLDetailsElement>('details')?.open).toBe(true)
    expect(board.querySelector<HTMLElement>('[data-scroller]')?.scrollTop).toBe(
      420
    )

    store.update({ currentDate: '2026-03-26' })
    expect(board.querySelector<HTMLDetailsElement>('details')?.open).toBe(true)
  })

  it('refreshes the current-time marker while active and clears its timer when hidden', () => {
    vi.useFakeTimers()
    const store = createPlaygroundStore()
    const board = createBoard(store)
    const setInterval = vi.spyOn(window, 'setInterval')
    const clearInterval = vi.spyOn(window, 'clearInterval')

    board.setActive(true)
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30_000)

    board.setActive(false)
    expect(clearInterval).toHaveBeenCalledWith(expect.anything())
  })
})
