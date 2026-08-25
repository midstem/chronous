import type { EventInput, RangeSpec } from '@midstem/chronous'
import { useMemo, useState } from 'react'

import { DEFAULT_PRESET, presetOf } from '../fixtures'
import type { PresetId } from '../fixtures'
import type { EventData } from '../types'

import { INITIAL_STATE } from './constants'
import { parseEvents, sourceOf, specOf } from './helpers'
import type { Playground, PlaygroundState } from './types'

export const usePlayground = (): Playground => {
  const [state, setState] = useState<PlaygroundState>(INITIAL_STATE)
  const [source, setSource] = useState(() => sourceOf(DEFAULT_PRESET.events))
  const [events, setEvents] = useState<readonly EventInput<EventData>[]>(
    DEFAULT_PRESET.events
  )
  const [problem, setProblem] = useState<string | null>(null)

  const spec = useMemo(() => specOf(state), [state])

  const update = (patch: Partial<PlaygroundState>): void =>
    setState((held) => ({ ...held, ...patch }))

  const changeSource = (next: string): void => {
    setSource(next)

    const parsed = parseEvents(next)

    setProblem(parsed.problem)

    if (parsed.problem === null) setEvents(parsed.events)
  }

  const choosePreset = (id: PresetId): void => {
    const preset = presetOf(id)

    setState((held) => ({
      ...held,
      preset: id,
      view: preset.view,
      date: preset.date,
      timeZone: preset.timeZone
    }))
    setSource(sourceOf(preset.events))
    setEvents(preset.events)
    setProblem(null)
  }

  const applySpec = (next: RangeSpec): void =>
    update({ view: next.view, date: next.date, timeZone: next.timeZone })

  const reset = (): void => {
    setState(INITIAL_STATE)
    setSource(sourceOf(DEFAULT_PRESET.events))
    setEvents(DEFAULT_PRESET.events)
    setProblem(null)
  }

  return {
    state,
    spec,
    source,
    events,
    problem,
    update,
    changeSource,
    choosePreset,
    applySpec,
    reset
  }
}

export type * from './types'
