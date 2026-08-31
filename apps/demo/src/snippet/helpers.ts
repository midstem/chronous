import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'

import { MONTH_VIEW, SLOTTED_VIEWS } from '../board'
import type { EventData } from '../types'

import { AGENDA_BODY } from './agenda'
import { MONTH_BODY, MONTH_HELPERS } from './month'
import { preambleOf } from './preamble'
import type { Needs } from './preamble'
import { CLOSING, OPENING } from './shell'
import { SLOTTED_BODY, slottedHelpers } from './slotted'

type Template = {
  needs: Needs
  helpers: readonly string[]
  body: readonly string[]
}

const templateOf = (range: CalendarRange, hourHeight: number): Template => {
  if (SLOTTED_VIEWS.includes(range.view))
    return {
      needs: { tones: true, clock: true },
      helpers: slottedHelpers(hourHeight),
      body: SLOTTED_BODY
    }

  if (range.view === MONTH_VIEW)
    return {
      needs: { tones: true, clock: false },
      helpers: MONTH_HELPERS,
      body: MONTH_BODY
    }

  return {
    needs: { tones: false, clock: false },
    helpers: [],
    body: AGENDA_BODY
  }
}

export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const { needs, helpers, body } = templateOf(range, hourHeight)

  return [
    ...preambleOf(range, events, locale, needs),
    ...helpers,
    ...OPENING,
    ...body,
    ...CLOSING
  ].join('\n')
}
