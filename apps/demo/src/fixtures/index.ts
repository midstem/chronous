import { ALL_DAY } from './all-day'
import { DST } from './dst'
import { OVERLAPS } from './overlaps'
import { RECURRENCE } from './recurrence'
import { SHOWCASE } from './showcase'
import type { Preset, PresetId } from './types'

export const PRESETS: readonly Preset[] = [
  {
    id: 'showcase',
    label: 'Showcase',
    hint: 'A little of everything: packed columns, a night shift, an all-day bar and a series.',
    view: 'week',
    date: '2026-03-25',
    timeZone: 'Europe/Kyiv',
    events: SHOWCASE
  },
  {
    id: 'overlaps',
    label: 'Overlapping columns',
    hint: 'Ten events on one day — the packing decides how many columns a box gets.',
    view: 'day',
    date: '2026-03-24',
    timeZone: 'Europe/Kyiv',
    events: OVERLAPS
  },
  {
    id: 'recurrence',
    label: 'Recurrence',
    hint: 'The supported RRULE subset, plus listed dates, an exception, a move and a cancellation.',
    view: 'month',
    date: '2026-03-25',
    timeZone: 'Europe/Kyiv',
    events: RECURRENCE
  },
  {
    id: 'allDay',
    label: 'All-day lanes',
    hint: 'Exclusive ends, stacked lanes, and the 24 wall hours that lift a timed event out of the grid.',
    view: 'week',
    date: '2026-03-25',
    timeZone: 'Europe/Kyiv',
    events: ALL_DAY
  },
  {
    id: 'dst',
    label: 'Daylight saving',
    hint: 'Kyiv springs forward on 2026-03-29. Switch the zone to America/Santiago or Australia/Lord_Howe and watch the same events move.',
    view: 'week',
    date: '2026-03-29',
    timeZone: 'Europe/Kyiv',
    events: DST
  },
  {
    id: 'empty',
    label: 'No events',
    hint: 'The bare range — days, rows and slots with nothing laid out on them.',
    view: 'week',
    date: '2026-03-25',
    timeZone: 'Europe/Kyiv',
    events: []
  }
]

export const DEFAULT_PRESET = PRESETS[0]

export const presetOf = (id: PresetId): Preset =>
  PRESETS.find((preset) => preset.id === id) ?? DEFAULT_PRESET

export type * from './types'
