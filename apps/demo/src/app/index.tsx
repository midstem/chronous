import type { ReactElement } from 'react'

import { Board } from '../board'
import { Boundary } from '../boundary'
import { Controls } from '../controls'
import { hourHeightOf } from '../density'
import { Events } from '../events'
import { presetOf } from '../fixtures'
import { Masthead } from '../masthead'
import { usePlayground } from '../playground'
import { Sidebar } from '../sidebar'
import { Snippet } from '../snippet'
import { useColorScheme } from '../theme'

export const App = (): ReactElement => {
  const playground = usePlayground()
  const scheme = useColorScheme()
  const { state, spec, source, events, problem } = playground

  return (
    <div className="flex h-dvh flex-col bg-canvas text-ink">
      <Masthead scheme={scheme} onReset={playground.reset} />

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,16rem)_minmax(0,1fr)] lg:grid-cols-[minmax(300px,23vw)_minmax(0,1fr)] lg:grid-rows-1">
        <Sidebar
          spec={
            <Controls
              state={state}
              update={playground.update}
              choosePreset={playground.choosePreset}
            />
          }
          events={
            <Events
              source={source}
              problem={problem}
              hint={presetOf(state.preset).hint}
              count={events.length}
              onChange={playground.changeSource}
            />
          }
          code={
            <Snippet
              spec={spec}
              events={events}
              locale={state.locale}
              hourHeight={hourHeightOf(state.density)}
            />
          }
        />

        <main className="flex min-h-0 min-w-0 flex-col">
          <Boundary key={JSON.stringify(spec)}>
            <Board
              spec={spec}
              events={events}
              locale={state.locale}
              density={state.density}
              onNavigate={playground.applySpec}
              onDensity={(density) => playground.update({ density })}
            />
          </Boundary>
        </main>
      </div>
    </div>
  )
}
