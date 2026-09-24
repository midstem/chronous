import type {
  EventInput,
  IsoDate,
  TimeZoneId,
  ViewKind
} from '@midstem/chronous-react'

import type { EventData } from '../types'

export type PresetId =
  'showcase' | 'overlaps' | 'recurrence' | 'allDay' | 'dst' | 'empty'

export type Preset = {
  id: PresetId
  label: string
  hint: string
  view: ViewKind
  date: IsoDate
  timeZone: TimeZoneId
  events: readonly EventInput<EventData>[]
}
