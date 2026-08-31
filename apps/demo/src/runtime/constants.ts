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
  native: {
    badge: 'Temporal: native',
    summary: 'This browser ships Temporal. Nothing was downloaded.',
    detail:
      'Chronous reads the engine straight off globalThis. The polyfill was never fetched, so none of it is in the page — this is what a modern browser costs you: nothing.'
  },
  polyfill: {
    badge: 'Temporal: polyfill',
    summary: 'This browser has no Temporal, so the playground loaded one.',
    detail:
      'The playground imported temporal-polyfill before the first render. Chronous itself never bundles it — installing the engine is the app’s call, which is why the same build runs on both kinds of browser.'
  },
  missing: {
    badge: 'Temporal: missing',
    summary: 'Temporal is not on globalThis and no polyfill loaded.',
    detail:
      'Chronous needs the engine before the first render. Nothing can be built until it is installed — check that the polyfill import ran, or open the playground in a browser from the list below.'
  }
}

export const SUPPORT: readonly SupportRow[] = [
  { browser: 'Chrome', since: '144', when: 'January 2026' },
  { browser: 'Edge', since: '144', when: 'January 2026' },
  { browser: 'Firefox', since: '139', when: 'May 2025' },
  { browser: 'Safari', since: 'not yet', when: 'flagged in Technology Preview' }
]
