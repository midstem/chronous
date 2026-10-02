import type { CalendarRange, ViewKind } from '@midstem/chronous'
import {
  BACK_LABEL,
  DENSITIES,
  DENSITY_LABEL,
  NEXT_LABEL,
  isSlotted
} from '@midstem/playground-core'
import type { Density } from '@midstem/playground-core'

import type { CalendarNavigation } from '../board/navigation'

export const VIEWS: readonly ViewKind[] = [
  'day',
  'week',
  'days',
  'month',
  'agenda'
]

export type ToolbarCallbacks = {
  onNavigate: (range: CalendarRange) => void
  onDensity: (density: Density) => void
}

export const createToolbar = (
  navigation: CalendarNavigation,
  title: string,
  range: CalendarRange,
  density: Density,
  callbacks: ToolbarCallbacks
): HTMLElement => {
  const header = document.createElement('header')
  header.className = 'flex flex-wrap items-center gap-3 pb-3'

  const slotted = isSlotted(range.view)

  header.innerHTML = `
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="ghost-button"
        aria-label="${BACK_LABEL}"
        data-action="prev"
        ${navigation.prev ? '' : 'disabled'}
      >
        ‹
      </button>
      <button
        type="button"
        class="ghost-button"
        data-action="today"
        ${navigation.today ? '' : 'disabled'}
      >
        Today
      </button>
      <button
        type="button"
        class="ghost-button"
        aria-label="${NEXT_LABEL}"
        data-action="next"
        ${navigation.next ? '' : 'disabled'}
      >
        ›
      </button>
    </div>

    <h2 class="mr-auto truncate text-lg font-semibold">${title}</h2>

    ${
      slotted
        ? `
      <div class="flex flex-col gap-1">
        <span class="px-1 text-[10px] font-medium text-muted">
          ${DENSITY_LABEL}
        </span>
        <div
          class="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
          role="group"
          aria-label="${DENSITY_LABEL}"
        >
          ${DENSITIES.map(
            (option) => `
            <button
              type="button"
              data-density="${option.value}"
              title="${option.value} row height · ${option.hourHeight}px per hour"
              aria-pressed="${option.value === density}"
              class="rounded-md px-2 py-1 text-xs font-medium ${
                option.value === density
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:text-ink'
              }"
            >
              ${option.label}
            </button>`
          ).join('')}
        </div>
      </div>`
        : ''
    }

    <div class="flex flex-col gap-1">
      <span class="px-1 text-[10px] font-medium text-muted">View</span>
      <div
        class="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
        role="group"
        aria-label="View"
      >
        ${VIEWS.map(
          (kind) => `
          <button
            type="button"
            data-view="${kind}"
            aria-pressed="${kind === range.view}"
            class="rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
              kind === range.view
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:text-ink'
            }"
          >
            ${kind}
          </button>`
        ).join('')}
      </div>
    </div>
  `

  const prevBtn = header.querySelector<HTMLButtonElement>(
    '[data-action="prev"]'
  )
  if (prevBtn && navigation.prev) {
    prevBtn.addEventListener('click', () => {
      if (navigation.prev) callbacks.onNavigate(navigation.prev)
    })
  }

  const todayBtn = header.querySelector<HTMLButtonElement>(
    '[data-action="today"]'
  )
  if (todayBtn && navigation.today) {
    todayBtn.addEventListener('click', () => {
      if (navigation.today) callbacks.onNavigate(navigation.today())
    })
  }

  const nextBtn = header.querySelector<HTMLButtonElement>(
    '[data-action="next"]'
  )
  if (nextBtn && navigation.next) {
    nextBtn.addEventListener('click', () => {
      if (navigation.next) callbacks.onNavigate(navigation.next)
    })
  }

  header
    .querySelectorAll<HTMLButtonElement>('button[data-density]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        callbacks.onDensity(btn.dataset.density as Density)
      })
    })

  header
    .querySelectorAll<HTMLButtonElement>('button[data-view]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextRange = navigation.withView(btn.dataset.view as ViewKind)
        callbacks.onNavigate(nextRange)
      })
    })

  return header
}
