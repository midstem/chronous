import type { RuntimeCopy, RuntimeState, SupportRow } from './types'

export const DIALOG_TITLE = 'Temporal in this browser'

export const CLOSE_LABEL = 'Close'

export const SUPPORT_TITLE = 'Where Temporal ships natively'

export const BASELINE_NOTE =
  'Temporal is still Limited availability on Baseline: every engine but Safari has shipped it, so the polyfill stays the fallback rather than the default.'

export const DOCS_LABEL = 'MDN: Temporal'

export const DOCS_URL =
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal'

export const COPY: Record<RuntimeState, RuntimeCopy> = {
  ready: {
    badge: 'Temporal: ready',
    summary: 'Temporal is available in this browser.',
    detail:
      'Chronous reads Temporal from globalThis. This demo imports temporal-polyfill/global at startup so it also works where Temporal is not native.'
  },
  missing: {
    badge: 'Temporal: missing',
    summary: 'Temporal is unavailable.',
    detail:
      'Install temporal-polyfill and import temporal-polyfill/global before rendering the calendar.'
  }
}

export const SUPPORT: readonly SupportRow[] = [
  { browser: 'Chrome', since: '144', when: 'January 2026' },
  { browser: 'Edge', since: '144', when: 'January 2026' },
  { browser: 'Firefox', since: '139', when: 'May 2025' },
  { browser: 'Safari', since: 'not yet', when: 'flagged in Technology Preview' }
]
