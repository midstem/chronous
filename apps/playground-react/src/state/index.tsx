import type { CalendarLayout } from '@midstem/chronous-react'
import { useState } from 'react'
import type { ReactElement } from 'react'

import type { EventData } from '../types'

import { STATE_HINT } from './constants'
import { jsonOf, summaryOf } from './helpers'

type StateProps = {
  calendar: CalendarLayout<EventData>
}

export const State = ({ calendar }: StateProps): ReactElement => {
  const [open, setOpen] = useState(false)

  return (
    <details
      className="shrink-0 border-t border-line bg-raised"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-muted">
        {summaryOf(calendar).map(({ label, value }) => (
          <span key={label} className="flex items-baseline gap-1">
            <span className="text-faint">{label}</span>
            <span className="font-mono text-ink">{value}</span>
          </span>
        ))}
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <p className="text-[11px] text-muted">{STATE_HINT}</p>
        {open && (
          <pre className="max-h-80 overflow-auto rounded-md bg-sunken p-3 font-mono text-[11px] leading-5">
            {jsonOf(calendar)}
          </pre>
        )}
      </div>
    </details>
  )
}
