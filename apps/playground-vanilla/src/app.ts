import { createBoard } from './board'
import { createMasthead } from './masthead'
import type { PlaygroundStore } from './playground'
import { createSidebar } from './sidebar'
import { createSnippetView } from './snippet'
import type { ThemeController } from './theme'

export const createApp = (
  store: PlaygroundStore,
  theme: ThemeController
): HTMLElement => {
  const root = document.createElement('div')
  root.className = 'flex h-dvh flex-col overflow-hidden bg-canvas text-ink'

  const masthead = createMasthead(store, theme)
  root.appendChild(masthead)

  const body = document.createElement('div')
  body.className =
    'grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,16rem)_minmax(0,1fr)] lg:grid-cols-[minmax(300px,23vw)_minmax(0,1fr)] lg:grid-rows-1'

  const sidebar = createSidebar(store)
  body.appendChild(sidebar)

  const main = document.createElement('main')
  main.className = 'flex min-h-0 min-w-0 flex-col'

  const board = createBoard(store)
  const snippet = createSnippetView(store)

  const updateMainView = (): void => {
    main.innerHTML = ''
    if (store.getMode() === 'calendar') {
      main.appendChild(board)
    } else {
      main.appendChild(snippet)
    }
  }

  updateMainView()
  store.subscribe(updateMainView)

  body.appendChild(main)
  root.appendChild(body)

  return root
}
