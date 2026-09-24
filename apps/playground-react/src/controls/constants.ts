import type { LocaleId, TimeZoneId, ViewKind } from '@midstem/chronous-react'

import type { Option } from '../fields'
import { UNSET } from '../constants'

export const VIEWS: readonly ViewKind[] = [
  'day',
  'week',
  'days',
  'month',
  'agenda'
]

export const VIEW_OPTIONS: readonly Option[] = VIEWS.map((view) => ({
  value: view,
  label: view
}))

export const ZONES: readonly TimeZoneId[] = [
  'Europe/Kyiv',
  'Europe/London',
  'America/New_York',
  'America/Santiago',
  'Australia/Lord_Howe',
  'Asia/Kolkata',
  'Pacific/Kiritimati',
  'UTC',
  'Not/AZone'
]

export const LOCALES: readonly LocaleId[] = [
  'en-GB',
  'en-US',
  'uk-UA',
  'de-DE',
  'ja-JP',
  'ar-EG'
]

export const WEEK_STARTS_ON_OPTIONS: readonly Option[] = [
  { value: UNSET, label: 'default — 1, Monday' },
  { value: '0', label: '0 — Sunday' },
  { value: '1', label: '1 — Monday' },
  { value: '2', label: '2 — Tuesday' },
  { value: '3', label: '3 — Wednesday' },
  { value: '4', label: '4 — Thursday' },
  { value: '5', label: '5 — Friday' },
  { value: '6', label: '6 — Saturday' }
]

export const DISAMBIGUATION_OPTIONS: readonly Option[] = [
  { value: UNSET, label: 'default — compatible' },
  { value: 'compatible', label: 'compatible' },
  { value: 'earlier', label: 'earlier' },
  { value: 'later', label: 'later' },
  { value: 'reject', label: 'reject' }
]

export const VIEW_HINT =
  'day, week and days draw a slotted grid; month and agenda only draw lanes.'

export const DATE_HINT =
  'The date the calendar is on. The period drawn is the one containing it: week snaps to the containing week, month to the containing month.'

export const TIME_ZONE_HINT =
  'Any IANA id. Not/AZone is in the list on purpose — it raises InvalidRangeError.'

export const WEEK_STARTS_ON_HINT =
  'Reads only in week and month, where it moves the first column of the grid.'

export const DAY_COUNT_HINT =
  'Reads only in days and agenda. Leave empty for 7 and 30. 0 raises InvalidRangeError.'

export const SLOT_MINUTES_HINT =
  'Reads only in the slotted views. Leave empty for 60. Anything outside 1…1440 raises InvalidRangeError.'

export const DISAMBIGUATION_HINT =
  'Which real moment a wall time means when DST repeated it or skipped it. compatible takes the earlier of a repeated pair and pushes a skipped time forward; reject raises InvalidEventError. Read on events only — the grid rows never read it.'

export const LOCALE_HINT =
  'Passed to formatIso for every heading, gutter label and cell number. The engine never reads it.'

export const PRESET_HINT = 'Replaces the events below with a ready fixture.'

export const STYLE_HINT =
  'How the board draws itself, and which file the Code tab prints. Simple keeps the same components with plain markup on them.'
