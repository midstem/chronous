import type { CalendarLayout } from '@midstem/chronous'
import { buildCalendar } from '@midstem/chronous'
import type { EventData } from '@midstem/playground-core'
import {
  MONTH_VIEW,
  hourHeightOf,
  isSimple,
  isSlotted,
  titleOf
} from '@midstem/playground-core'

import type { PlaygroundStore } from '../playground'
import { createToolbar } from '../toolbar'
import { renderAgenda } from '../views/agenda'
import { getNow } from '../views/helpers'
import { renderMonth } from '../views/month'
import { renderPlainAgenda } from '../views/plain-agenda'
import { renderPlainMonth } from '../views/plain-month'
import { renderPlainSlotted } from '../views/plain-slotted'
import { renderSlotted } from '../views/slotted'
import { createNavigation } from './navigation'
import { createStateInspector } from './state'

const SCROLL_TO_HOUR = 7

export const createBoard = (store: PlaygroundStore): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'flex min-h-0 flex-1 flex-col p-4'

  const render = (): void => {
    container.innerHTML = ''

    const state = store.getState()
    const range = store.getRange()
    const events = store.getEvents()
    const locale = state.locale
    const density = state.density
    const style = state.style
    const plain = isSimple(style)
    const hourHeight = hourHeightOf(density)

    const navigation = createNavigation(range)
    const now = getNow(range.timeZone)
    const today = now ? now.date : null

    const onNavigate = (nextRange: typeof range): void => {
      store.applyRange(nextRange)
    }

    const onDensity = (nextDensity: typeof density): void => {
      store.update({ density: nextDensity })
    }

    let calendar: CalendarLayout<EventData>
    try {
      calendar = buildCalendar(range, events)
    } catch (err: unknown) {
      const error = err as Error
      const toolbar = createToolbar(
        navigation,
        range.currentDate,
        range,
        density,
        { onNavigate, onDensity }
      )
      container.appendChild(toolbar)

      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.className =
        'rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger'
      alert.innerHTML = `<strong class="font-mono">${error.name}</strong>: ${error.message}`
      container.appendChild(alert)
      return
    }

    const title = titleOf(calendar, locale)
    const toolbar = createToolbar(navigation, title, range, density, {
      onNavigate,
      onDensity
    })
    container.appendChild(toolbar)

    const section = document.createElement('section')
    section.className =
      'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm'

    const scroller = document.createElement('div')
    scroller.setAttribute('data-scroller', '')
    scroller.className = 'min-h-0 flex-1 overflow-auto'

    let viewHtml = ''
    if (isSlotted(range.view)) {
      viewHtml = plain
        ? renderPlainSlotted(calendar, locale, hourHeight)
        : renderSlotted(calendar, locale, hourHeight, today, now)
    } else if (range.view === MONTH_VIEW) {
      viewHtml = plain
        ? renderPlainMonth(calendar, locale)
        : renderMonth(calendar, locale, today)
    } else {
      viewHtml = plain
        ? renderPlainAgenda(calendar, locale)
        : renderAgenda(calendar, locale, today)
    }

    scroller.innerHTML = viewHtml
    section.appendChild(scroller)

    const stateInspector = createStateInspector(calendar)
    section.appendChild(stateInspector)

    container.appendChild(section)

    if (isSlotted(range.view)) {
      requestAnimationFrame(() => {
        scroller.scrollTop = hourHeight * SCROLL_TO_HOUR
      })
    }
  }

  render()
  store.subscribe(render)

  return container
}
