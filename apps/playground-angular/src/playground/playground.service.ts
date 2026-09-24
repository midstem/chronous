import { Injectable, computed, signal } from '@angular/core'
import type { CalendarRange, EventInput } from '@midstem/chronous-angular'
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

@Injectable({ providedIn: 'root' })
export class PlaygroundService {
  readonly state = signal<PlaygroundState>(INITIAL_STATE)
  readonly source = signal<string>(sourceOf(DEFAULT_PRESET.events))
  readonly events = signal<readonly EventInput<EventData>[]>(
    DEFAULT_PRESET.events
  )
  readonly problem = signal<string | null>(null)

  readonly range = computed<CalendarRange>(() => rangeOf(this.state()))

  update(patch: Partial<PlaygroundState>): void {
    this.state.update((held) => ({ ...held, ...patch }))
  }

  changeSource(next: string): void {
    this.source.set(next)

    const parsed = parseEvents(next)
    this.problem.set(parsed.problem)

    if (parsed.problem === null) {
      this.events.set(parsed.events)
    }
  }

  choosePreset(id: PresetId): void {
    const preset = presetOf(id)

    this.state.update((held) => ({
      ...held,
      preset: id,
      view: preset.view,
      currentDate: preset.date,
      timeZone: preset.timeZone
    }))
    this.source.set(sourceOf(preset.events))
    this.events.set(preset.events)
    this.problem.set(null)
  }

  applyRange(next: CalendarRange): void {
    this.update({
      view: next.view,
      currentDate: next.currentDate,
      timeZone: next.timeZone
    })
  }

  reset(): void {
    this.state.set(INITIAL_STATE)
    this.source.set(sourceOf(DEFAULT_PRESET.events))
    this.events.set(DEFAULT_PRESET.events)
    this.problem.set(null)
  }
}
