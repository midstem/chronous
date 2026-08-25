import type { RangeSpec } from '@midstem/chronous'
import type { CalendarNavigation } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

type ToolbarProps = {
  navigation: CalendarNavigation
  title: string
  onChange: (spec: RangeSpec) => void
}

export const Toolbar = ({
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
      <button
        type="button"
        disabled={!navigation.today}
        onClick={() => navigation.today && onChange(navigation.today())}
      >
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
  </header>
)
