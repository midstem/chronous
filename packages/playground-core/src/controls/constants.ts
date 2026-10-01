import type { LocaleId, TimeZoneId, ViewKind } from '@midstem/chronous'

import type { Option } from '../types'
import { UNSET } from '../constants'
import { PRESETS } from '../fixtures'

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
  'UTC'
]

export const LOCALES: readonly LocaleId[] = [
  'en-GB',
  'en-US',
  'uk-UA',
  'de-DE',
  'ja-JP',
  'ar-EG'
]

export const LOCALE_OPTIONS: readonly Option[] = [
  { value: 'en-GB', label: 'English (UK) — en-GB' },
  { value: 'en-US', label: 'English (US) — en-US' },
  { value: 'uk-UA', label: 'Ukrainian — uk-UA' },
  { value: 'de-DE', label: 'German — de-DE' },
  { value: 'ja-JP', label: 'Japanese — ja-JP' },
  { value: 'ar-EG', label: 'Arabic (Egypt) — ar-EG' }
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
  { value: UNSET, label: 'Default — compatible' },
  { value: 'compatible', label: 'Compatible — earlier / move forward' },
  { value: 'earlier', label: 'Earlier — first matching time' },
  { value: 'later', label: 'Later — last matching time' },
  { value: 'reject', label: 'Reject — report missing or repeated time' }
]

export const VIEW_HINT =
  'Choose the calendar layout. Day, week and days show an hourly grid; month and agenda show event lanes.'

export const DATE_HINT =
  'The date in focus. Week and month views expand to include the selected date.'

export const TIME_ZONE_HINT =
  'Controls which local time appears in the calendar. Choose a common zone or enter any IANA time-zone ID.'

export const WEEK_STARTS_ON_HINT =
  'Sets the first weekday in week and month views. Leave on default to use Monday.'

export const DAY_COUNT_HINT =
  'Sets the number of days shown in days and agenda views. Defaults to 7 days or 30 agenda days.'

export const SLOT_MINUTES_HINT =
  'Sets the duration of each time slot in day, week and days views. Defaults to 60 minutes; row height is adjusted above the calendar.'

export const DISAMBIGUATION_HINT =
  'Resolves event times that repeat or disappear during daylight-saving clock changes. Applies to events only; the time grid is unchanged.'

export const LOCALE_HINT =
  'Changes the language and date formatting used in calendar headings and labels. Choose a common locale or enter any BCP 47 tag.'

export const PRESET_HINT =
  'Event examples replace any edited events, then reset the date, view and time zone. The View buttons above the calendar only change how the current dates are displayed.'

export const PRESET_OPTIONS: readonly Option[] = PRESETS.map(
  ({ id, label }) => ({
    value: id,
    label
  })
)

export const STYLE_HINT =
  'Choose the calendar markup style. The Code tab updates to show the matching example.'
