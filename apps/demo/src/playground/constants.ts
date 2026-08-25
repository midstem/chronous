import { DEFAULT_PRESET } from '../fixtures'
import { UNSET } from '../constants'

import type { PlaygroundState } from './types'

export const INITIAL_STATE: PlaygroundState = {
  view: DEFAULT_PRESET.view,
  date: DEFAULT_PRESET.date,
  timeZone: DEFAULT_PRESET.timeZone,
  weekStartsOn: UNSET,
  dayCount: UNSET,
  slotMinutes: UNSET,
  disambiguation: UNSET,
  locale: 'en-GB',
  preset: DEFAULT_PRESET.id
}

export const EVENTS_NOT_AN_ARRAY = 'The events must be a JSON array.'

export const eventNotAnObject = (index: number): string =>
  `Event ${index} is not an object.`

export const eventWithoutId = (index: number): string =>
  `Event ${index} has no string "id".`

export const eventWithoutStart = (index: number): string =>
  `Event ${index} has no string "start".`
