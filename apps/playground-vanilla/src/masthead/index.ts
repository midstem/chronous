import {
  DARK_LABEL,
  FRAMEWORK_NAV_LABEL,
  HEADLINE,
  LIGHT_LABEL,
  MODES,
  MODE_LABEL,
  REPOSITORY_URL,
  RESET_LABEL,
  TAGLINE,
  MASTHEAD_DOCS_LABEL as DOCS_LABEL,
  getFrameworkLinks,
  getFrameworkLogo,
  opposite
} from '@midstem/playground-core'
import type { Mode } from '@midstem/playground-core'

import type { PlaygroundStore } from '../playground'
import { createRuntime } from '../runtime'
import type { ThemeController } from '../theme'

export const createMasthead = (
  store: PlaygroundStore,
  theme: ThemeController
): HTMLElement => {
  const header = document.createElement('header')
  header.className =
    'flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5'

  const frameworks = getFrameworkLinks('vanilla')
  const logo = getFrameworkLogo('vanilla')
  const { button: runtimeBtn, dialog: runtimeDialog } = createRuntime()

  const render = (): void => {
    const currentMode = store.getMode()
    const pinned = theme.getPinned()
    const resolved = theme.getResolved()
    const next = opposite(resolved)

    header.innerHTML = `
      <h1 class="flex items-center gap-2 text-base font-semibold">
        <svg
          class="shrink-0"
          viewBox="${logo.viewBox}"
          width="24"
          height="24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >${logo.svg}</svg>
        <span class="flex items-baseline gap-2">
          ${HEADLINE}
          <span class="text-xs font-normal text-faint">${TAGLINE}</span>
        </span>
      </h1>

      <nav
        class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5 embed:hidden"
        data-framework-nav
        aria-label="${FRAMEWORK_NAV_LABEL}"
      >
        ${frameworks
          .map(
            (link) => `
          <a
            href="${link.href}"
            ${link.isCurrent ? 'aria-current="page"' : ''}
            class="rounded px-3 py-1 text-[13px] font-medium no-underline transition-colors ${
              link.isCurrent
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:text-ink'
            }"
          >
            ${link.title}
          </a>`
          )
          .join('')}
      </nav>

      <div
        class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
        role="group"
        aria-label="${MODE_LABEL}"
      >
        ${MODES.map(
          (option) => `
          <button
            type="button"
            data-mode="${option.value}"
            aria-pressed="${option.value === currentMode}"
            class="rounded px-3 py-1 text-[13px] font-medium ${
              option.value === currentMode
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:text-ink'
            }"
          >
            ${option.label}
          </button>`
        ).join('')}
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2" data-actions>
        <button
          type="button"
          class="ghost-button"
          data-scheme-toggle
          aria-pressed="${pinned !== null}"
          title="${pinned ? 'Follow the system setting' : `Pin the ${next} theme`}"
        >
          <span aria-hidden="true">${resolved === 'dark' ? '☾' : '☀'}</span>
          ${resolved === 'dark' ? DARK_LABEL : LIGHT_LABEL}
        </button>
        <button type="button" class="ghost-button" data-reset>
          ${RESET_LABEL}
        </button>
        <a
          class="ghost-button"
          href="${REPOSITORY_URL}"
          target="_blank"
          rel="noreferrer"
        >
          ${DOCS_LABEL}
        </a>
      </div>
    `

    const actions = header.querySelector('[data-actions]')
    if (actions) {
      actions.insertBefore(runtimeBtn, actions.firstChild)
    }

    header
      .querySelectorAll<HTMLButtonElement>('button[data-mode]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const modeVal = btn.dataset.mode as Mode
          store.setMode(modeVal)
        })
      })

    const schemeBtn = header.querySelector<HTMLButtonElement>(
      '[data-scheme-toggle]'
    )
    if (schemeBtn) {
      schemeBtn.addEventListener('click', () => {
        theme.toggle()
      })
    }

    const resetBtn = header.querySelector<HTMLButtonElement>('[data-reset]')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        store.reset()
      })
    }
  }

  document.body.appendChild(runtimeDialog)

  render()
  store.subscribe(render)
  theme.subscribe(render)

  return header
}
