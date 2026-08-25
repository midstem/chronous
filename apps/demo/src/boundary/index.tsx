import { Component } from 'react'
import type { ReactNode } from 'react'

import { BOUNDARY_HINT, BOUNDARY_TITLE, RELOAD_LABEL } from './constants'

type BoundaryProps = {
  children: ReactNode
}

type BoundaryState = {
  failure: Error | null
}

export class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failure: null }

  static getDerivedStateFromError(failure: Error): BoundaryState {
    return { failure }
  }

  render(): ReactNode {
    const { failure } = this.state

    if (!failure) return this.props.children

    return (
      <section className="card boundary">
        <h2 className="card-title">{BOUNDARY_TITLE}</h2>
        <p className="error">{failure.message}</p>
        <p className="field-hint">{BOUNDARY_HINT}</p>
        <div>
          <button type="button" onClick={() => window.location.reload()}>
            {RELOAD_LABEL}
          </button>
        </div>
      </section>
    )
  }
}
