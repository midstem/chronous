import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

import { DEFAULT_TAB, TABS } from './constants'
import type { TabId } from './types'

type SidebarProps = {
  range: ReactNode
  events: ReactNode
}

export const Sidebar = ({ range, events }: SidebarProps): ReactElement => {
  const [tab, setTab] = useState<TabId>(DEFAULT_TAB)

  return (
    <aside className="flex min-h-0 flex-col border-r border-line bg-raised">
      <div className="flex shrink-0 gap-0.5 border-b border-line px-2 pt-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === tab}
            className={`rounded-t-md border-b-2 px-3 py-2 text-[13px] font-medium ${id === tab ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        {tab === 'range' && range}
        {tab === 'events' && events}
      </div>
    </aside>
  )
}

export type * from './types'
