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
      <section className="m-4 flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-4">
        <h2 className="text-base font-semibold">{BOUNDARY_TITLE}</h2>
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {failure.message}
        </p>
        <p className="text-[11px] text-muted">{BOUNDARY_HINT}</p>
        <button
          type="button"
          className="ghost-button"
          onClick={() => window.location.reload()}
        >
          {RELOAD_LABEL}
        </button>
      </section>
    )
  }
}
