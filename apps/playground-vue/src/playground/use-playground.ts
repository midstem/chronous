import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import type { CalendarRange, EventInput } from '@midstem/chronous-vue'
import {
  DEFAULT_PRESET,
  INITIAL_STATE,
  parseEvents,
  presetOf,
  rangeOf,
  sourceOf
} from '@midstem/playground-core'
import type {
  EventData,
  PlaygroundState,
  PresetId
} from '@midstem/playground-core'

export interface PlaygroundInstance {
  state: Ref<PlaygroundState>
  range: ComputedRef<CalendarRange>
  source: Ref<string>
  events: Ref<readonly EventInput<EventData>[]>
  problem: Ref<string | null>
  update: (patch: Partial<PlaygroundState>) => void
  changeSource: (next: string) => void
  choosePreset: (id: PresetId) => void
  applyRange: (next: CalendarRange) => void
  reset: () => void
}

export const createPlayground = (): PlaygroundInstance => {
  const state = ref<PlaygroundState>(INITIAL_STATE)
  const source = ref<string>(sourceOf(DEFAULT_PRESET.events))
  const events = ref<readonly EventInput<EventData>[]>(DEFAULT_PRESET.events)
  const problem = ref<string | null>(null)

  const range = computed<CalendarRange>(() => rangeOf(state.value))

  const update = (patch: Partial<PlaygroundState>): void => {
    state.value = { ...state.value, ...patch }
  }

  const changeSource = (next: string): void => {
    source.value = next
    const parsed = parseEvents(next)
    problem.value = parsed.problem

    if (parsed.problem === null && parsed.events !== null) {
      events.value = parsed.events
    }
  }

  const choosePreset = (id: PresetId): void => {
    const preset = presetOf(id)

    state.value = {
      ...state.value,
      preset: id,
      view: preset.view,
      currentDate: preset.date,
      timeZone: preset.timeZone
    }
    source.value = sourceOf(preset.events)
    events.value = preset.events
    problem.value = null
  }

  const applyRange = (next: CalendarRange): void => {
    update({
      view: next.view,
      currentDate: next.currentDate,
      timeZone: next.timeZone
    })
  }

  const reset = (): void => {
    state.value = INITIAL_STATE
    source.value = sourceOf(DEFAULT_PRESET.events)
    events.value = DEFAULT_PRESET.events
    problem.value = null
  }

  return {
    state,
    range,
    source,
    events,
    problem,
    update,
    changeSource,
    choosePreset,
    applyRange,
    reset
  }
}

let sharedPlayground: PlaygroundInstance | null = null

export const usePlayground = (): PlaygroundInstance => {
  if (!sharedPlayground) {
    sharedPlayground = createPlayground()
  }
  return sharedPlayground
}
