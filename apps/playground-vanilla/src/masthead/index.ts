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
          viewBox="0 0 128 128"
          width="24"
          height="24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="128" height="128" fill="#f7df1e" rx="4" />
          <path
            fill="#000000"
            d="m85.98 99.99c2.58 4.21 5.93 7.31 11.87 7.31 4.99 0 8.17-2.49 8.17-5.93 0-4.13-3.27-5.59-8.76-7.99l-3.01-1.29c-8.68-3.7-14.45-8.34-14.45-18.13 0-9.03 6.88-15.89 17.62-15.89 7.65 0 13.15 2.66 17.11 9.63l-9.37 6.02c-2.06-3.7-4.29-5.16-7.74-5.16-3.52 0-5.76 2.24-5.76 5.16 0 3.61 2.24 5.07 7.4 7.31l3.01 1.29c10.22 4.38 15.99 8.85 15.99 18.9 0 10.83-8.51 16.77-19.93 16.77-11.17 0-18.39-5.32-21.66-12.37zm-42.67 1.12c-2.41 1.29-5.5 2.06-8.85 2.06-8.77 0-14.44-4.38-14.44-13.75v-38.45h12.03v37.5c0 4.9 1.89 7.22 5.84 7.22 3.18 0 5.42-.86 7.22-1.89v9.34z"
          />
        </svg>
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
