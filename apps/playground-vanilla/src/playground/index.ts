import type { CalendarRange, EventInput } from '@midstem/chronous'
import {
  DEFAULT_MODE,
  DEFAULT_PRESET,
  INITIAL_STATE,
  parseEvents,
  presetOf,
  rangeOf,
  sourceOf
} from '@midstem/playground-core'
import type {
  EventData,
  Mode,
  PlaygroundState,
  PresetId
} from '@midstem/playground-core'

export type PlaygroundStore = {
  getState: () => PlaygroundState
  getRange: () => CalendarRange
  getSource: () => string
  getEvents: () => readonly EventInput<EventData>[]
  getProblem: () => string | null
  getMode: () => Mode
  setMode: (mode: Mode) => void
  update: (patch: Partial<PlaygroundState>) => void
  changeSource: (next: string) => void
  choosePreset: (id: PresetId) => void
  applyRange: (next: CalendarRange) => void
  reset: () => void
  subscribe: (listener: (reason?: 'preset' | 'reset') => void) => () => void
}

export const createPlaygroundStore = (): PlaygroundStore => {
  let state: PlaygroundState = { ...INITIAL_STATE }
  let source: string = sourceOf(DEFAULT_PRESET.events)
  let events: readonly EventInput<EventData>[] = DEFAULT_PRESET.events
  let problem: string | null = null
  let mode: Mode = DEFAULT_MODE
  const listeners = new Set<(reason?: 'preset' | 'reset') => void>()

  const notify = (reason?: 'preset' | 'reset'): void => {
    listeners.forEach((fn) => fn(reason))
  }

  const update = (patch: Partial<PlaygroundState>): void => {
    state = { ...state, ...patch }
    notify()
  }

  const changeSource = (next: string): void => {
    source = next
    const parsed = parseEvents(next)
    problem = parsed.problem
    if (parsed.problem === null) {
      events = parsed.events
    }
    notify()
  }

  const choosePreset = (id: PresetId): void => {
    const preset = presetOf(id)
    state = {
      ...state,
      preset: id,
      view: preset.view,
      currentDate: preset.date,
      timeZone: preset.timeZone
    }
    source = sourceOf(preset.events)
    events = preset.events
    problem = null
    notify('preset')
  }

  const applyRange = (next: CalendarRange): void => {
    update({
      view: next.view,
      currentDate: next.currentDate,
      timeZone: next.timeZone
    })
  }

  const reset = (): void => {
    state = { ...INITIAL_STATE }
    source = sourceOf(DEFAULT_PRESET.events)
    events = DEFAULT_PRESET.events
    problem = null
    notify('reset')
  }

  const setMode = (nextMode: Mode): void => {
    if (mode !== nextMode) {
      mode = nextMode
      notify()
    }
  }

  return {
    getState: () => state,
    getRange: () => rangeOf(state),
    getSource: () => source,
    getEvents: () => events,
    getProblem: () => problem,
    getMode: () => mode,
    setMode,
    update,
    changeSource,
    choosePreset,
    applyRange,
    reset,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}
