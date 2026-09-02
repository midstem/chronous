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
    summary: 'This browser has no Temporal, so Chronous loaded one.',
    detail:
      'The first calendar render found no engine on globalThis and pulled temporal-polyfill in through a dynamic import — its own chunk, fetched only here. The playground calls nothing to make that happen, and the same build runs on both kinds of browser.'
  },
  missing: {
    badge: 'Temporal: missing',
    summary: 'The engine is not here yet — loading, or the load failed.',
    detail:
      'Chronous fetches temporal-polyfill on the first render that needs it, and draws nothing until the chunk lands. Seeing this badge settle here means the request never resolved — check the network panel, or open the playground in a browser from the list below.'
  }
}

export const SUPPORT: readonly SupportRow[] = [
  { browser: 'Chrome', since: '144', when: 'January 2026' },
  { browser: 'Edge', since: '144', when: 'January 2026' },
  { browser: 'Firefox', since: '139', when: 'May 2025' },
  { browser: 'Safari', since: 'not yet', when: 'flagged in Technology Preview' }
]
