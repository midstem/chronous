import type { ReactElement } from 'react'

import { Board } from '../board'
import { Boundary } from '../boundary'
import { REPOSITORY_URL } from '../constants'
import { Controls } from '../controls'
import { Events } from '../events'
import { presetOf } from '../fixtures'
import { usePlayground } from '../playground'
import { Runtime } from '../runtime'
import { Snippet } from '../snippet'

import { HEADLINE, MASTHEAD_HINT } from './constants'

export const App = (): ReactElement => {
  const playground = usePlayground()
  const { state, spec, source, events, problem } = playground

  return (
    <div className="page">
      <header className="masthead">
        <div>
          <h1 className="masthead-title">{HEADLINE}</h1>
          <p className="masthead-hint">{MASTHEAD_HINT}</p>
        </div>
        <div className="masthead-actions">
          <Runtime />
          <button type="button" onClick={playground.reset}>
            Reset
          </button>
          <a className="masthead-link" href={REPOSITORY_URL}>
            Documentation
          </a>
        </div>
      </header>

      <div className="layout">
        <Controls
          state={state}
          update={playground.update}
          choosePreset={playground.choosePreset}
        />

        <main className="stage">
          <Boundary key={JSON.stringify(spec)}>
            <Board
              spec={spec}
              events={events}
              locale={state.locale}
              onNavigate={playground.applySpec}
            />
          </Boundary>

          <Events
            source={source}
            problem={problem}
            hint={presetOf(state.preset).hint}
            count={events.length}
            onChange={playground.changeSource}
          />

          <Snippet spec={spec} locale={state.locale} />
        </main>
      </div>
    </div>
  )
}
