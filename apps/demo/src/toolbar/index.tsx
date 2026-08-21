import type { RangeSpec, ViewKind } from '@midstem/chronous'
import type { CalendarNavigation } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { VIEWS, ZONES } from '../app/constants'

type ToolbarProps = {
  spec: RangeSpec
  navigation: CalendarNavigation
  title: string
  onChange: (spec: RangeSpec) => void
}

export const Toolbar = ({
  spec,
  navigation,
  title,
  onChange
}: ToolbarProps): ReactElement => (
  <header className="toolbar">
    <div className="moves">
      <button
        type="button"
        disabled={!navigation.prev}
        onClick={() => navigation.prev && onChange(navigation.prev)}
      >
        Back
      </button>
      <button type="button" onClick={() => onChange(navigation.today())}>
        Today
      </button>
      <button
        type="button"
        disabled={!navigation.next}
        onClick={() => navigation.next && onChange(navigation.next)}
      >
        Forward
      </button>
    </div>
    <h1 className="title">{title}</h1>
    <div className="pickers">
      <select
        aria-label="View"
        value={spec.view}
        onChange={(event) =>
          onChange(navigation.withView(event.target.value as ViewKind))
        }
      >
        {VIEWS.map((view) => (
          <option key={view} value={view}>
            {view}
          </option>
        ))}
      </select>
      <select
        aria-label="Time zone"
        value={spec.timeZone}
        onChange={(event) =>
          onChange({ ...spec, timeZone: event.target.value })
        }
      >
        {ZONES.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </select>
    </div>
  </header>
)
