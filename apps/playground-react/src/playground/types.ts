import type {
  EventInput,
  IsoDate,
  LocaleId,
  CalendarRange,
  TimeZoneId,
  ViewKind
} from '@midstem/chronous-react'

import type { Density } from '../density'
import type { Style } from '../style'
import type { PresetId } from '../fixtures'
import type { EventData } from '../types'

export type PlaygroundState = {
  view: ViewKind
  currentDate: IsoDate
  timeZone: TimeZoneId
  weekStartsOn: string
  dayCount: string
  slotMinutes: string
  disambiguation: string
  locale: LocaleId
  preset: PresetId
  density: Density
  style: Style
}

export type ParseResult =
  | { events: readonly EventInput<EventData>[]; problem: null }
  | { events: null; problem: string }

export type Playground = {
  state: PlaygroundState
  range: CalendarRange
  source: string
  events: readonly EventInput<EventData>[]
  problem: string | null
  update: (patch: Partial<PlaygroundState>) => void
  changeSource: (source: string) => void
  choosePreset: (id: PresetId) => void
  applyRange: (range: CalendarRange) => void
  reset: () => void
}
