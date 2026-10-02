import { hourHeightOf, isSimple } from '@midstem/playground-core'

import { createCodeView } from '../code'
import type { PlaygroundStore } from '../playground'
import {
  FILE_NAME,
  SIMPLE_HINT,
  SNIPPET_HINT,
  badgeOf,
  simpleBadgeOf
} from './constants'
import { simpleOf, snippetOf } from './helpers'

export const createSnippetView = (store: PlaygroundStore): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'flex min-h-0 flex-1 flex-col'

  const render = (): void => {
    container.innerHTML = ''
    const state = store.getState()
    const range = store.getRange()
    const events = store.getEvents()
    const locale = state.locale
    const hourHeight = hourHeightOf(state.density)
    const plain = isSimple(state.style)

    const codeView = plain
      ? createCodeView({
          fileName: FILE_NAME,
          badge: simpleBadgeOf(range.view, events.length),
          hint: SIMPLE_HINT,
          source: simpleOf(range, events, locale, hourHeight)
        })
      : createCodeView({
          fileName: FILE_NAME,
          badge: badgeOf(range.view, hourHeight, locale, events.length),
          hint: SNIPPET_HINT,
          source: snippetOf(range, events, locale, hourHeight)
        })

    container.appendChild(codeView)
  }

  render()
  store.subscribe(render)

  return container
}
