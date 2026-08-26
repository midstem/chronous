import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import { DARK_LABEL, DARK_QUERY, LIGHT_LABEL } from './constants'
import { applyScheme, opposite, storedScheme, systemScheme } from './helpers'
import type { ColorScheme, Scheme } from './types'

export const useColorScheme = (): ColorScheme => {
  const [pinned, setPinned] = useState<Scheme | null>(storedScheme)
  const [system, setSystem] = useState<Scheme>(systemScheme)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const sync = (): void => setSystem(systemScheme())

    media.addEventListener('change', sync)

    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => applyScheme(pinned), [pinned])

  return {
    pinned,
    resolved: pinned ?? system,
    toggle: () => setPinned((held) => (held ? null : opposite(system)))
  }
}

export const SchemeToggle = ({
  pinned,
  resolved,
  toggle
}: ColorScheme): ReactElement => {
  const next = opposite(resolved)

  return (
    <button
      type="button"
      className="ghost-button"
      aria-pressed={pinned !== null}
      title={pinned ? 'Follow the system setting' : `Pin the ${next} theme`}
      onClick={toggle}
    >
      <span aria-hidden="true">{resolved === 'dark' ? '☾' : '☀'}</span>
      {resolved === 'dark' ? DARK_LABEL : LIGHT_LABEL}
    </button>
  )
}

export type * from './types'
