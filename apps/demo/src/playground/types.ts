import type {
  EventInput,
  IsoDate,
  LocaleId,
  RangeSpec,
  TimeZoneId,
  ViewKind
} from '@midstem/chronous'

import type { PresetId } from '../fixtures'
import type { EventData } from '../types'

export type PlaygroundState = {
  view: ViewKind
  date: IsoDate
  timeZone: TimeZoneId
  weekStartsOn: string
  dayCount: string
  slotMinutes: string
  disambiguation: string
  locale: LocaleId
  preset: PresetId
}

export type ParseResult =
  | { events: readonly EventInput<EventData>[]; problem: null }
  | { events: null; problem: string }

export type Playground = {
  state: PlaygroundState
  spec: RangeSpec
  source: string
  events: readonly EventInput<EventData>[]
  problem: string | null
  update: (patch: Partial<PlaygroundState>) => void
  changeSource: (source: string) => void
  choosePreset: (id: PresetId) => void
  applySpec: (spec: RangeSpec) => void
  reset: () => void
}
