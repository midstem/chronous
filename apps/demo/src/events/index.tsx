import type { ReactElement } from 'react'

import { EVENTS_HINT, ROWS } from './constants'

type EventsProps = {
  source: string
  problem: string | null
  hint: string
  count: number
  onChange: (source: string) => void
}

export const Events = ({
  source,
  problem,
  hint,
  count,
  onChange
}: EventsProps): ReactElement => (
  <section className="card">
    <h2 className="card-title">
      Events
      <span className="panel-badge">EventInput[] · {count} on the board</span>
    </h2>
    <p className="field-hint">{hint}</p>
    <textarea
      className={problem ? 'source source-broken' : 'source'}
      aria-label="Events JSON"
      spellCheck={false}
      rows={ROWS}
      value={source}
      onChange={(event) => onChange(event.target.value)}
    />
    {problem ? (
      <p className="error">{problem}</p>
    ) : (
      <p className="field-hint">{EVENTS_HINT}</p>
    )}
  </section>
)
