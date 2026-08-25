import type { Calendar } from '@midstem/chronous'
import { useState } from 'react'
import type { ReactElement } from 'react'

import type { EventData } from '../types'

import { STATE_HINT } from './constants'
import { jsonOf, summaryOf } from './helpers'

type StateProps = {
  calendar: Calendar<EventData>
}

export const State = ({ calendar }: StateProps): ReactElement => {
  const [open, setOpen] = useState(false)

  return (
    <section className="card">
      <h2 className="card-title">
        Calendar
        <span className="panel-badge">buildCalendar result</span>
      </h2>
      <dl className="metrics">
        {summaryOf(calendar).map(({ label, value }) => (
          <div className="metric" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <details onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary>Raw JSON</summary>
        <p className="field-hint">{STATE_HINT}</p>
        {open && <pre className="code">{jsonOf(calendar)}</pre>}
      </details>
    </section>
  )
}
