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
  <div className="flex min-h-0 flex-1 flex-col gap-2">
    <p className="text-[11px] leading-4 text-muted">{hint}</p>
    <p className="font-mono text-[10px] text-faint">
      EventInput[] · {count} on the board
    </p>
    <textarea
      className={`field-control min-h-0 flex-1 resize-none font-mono text-[11px] leading-5 ${problem ? 'border-danger' : ''}`}
      aria-label="Events JSON"
      spellCheck={false}
      rows={ROWS}
      value={source}
      onChange={(event) => onChange(event.target.value)}
    />
    {problem ? (
      <p role="alert" className="text-[11px] leading-4 text-danger">
        {problem}
      </p>
    ) : (
      <p className="text-[11px] leading-4 text-muted">{EVENTS_HINT}</p>
    )}
  </div>
)
