import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'

import { MONTH_VIEW, SLOTTED_VIEWS } from '../board'
import type { EventData } from '../types'

import { AGENDA_BODY, AGENDA_HELPERS } from './agenda'
import { MONTH_BODY, MONTH_HELPERS } from './month'
import { preambleOf } from './preamble'
import { CLOSING, OPENING } from './shell'
import { SLOTTED_BODY, slottedHelpers } from './slotted'

type Template = {
  helpers: readonly string[]
  body: readonly string[]
}

const templateOf = (range: CalendarRange, hourHeight: number): Template => {
  if (SLOTTED_VIEWS.includes(range.view))
    return { helpers: slottedHelpers(hourHeight), body: SLOTTED_BODY }

  if (range.view === MONTH_VIEW)
    return { helpers: MONTH_HELPERS, body: MONTH_BODY }

  return { helpers: AGENDA_HELPERS, body: AGENDA_BODY }
}

export const simpleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const { helpers, body } = templateOf(range, hourHeight)

  return [
    ...preambleOf(range, events, locale),
    ...helpers,
    ...OPENING,
    ...body,
    ...CLOSING
  ].join('\n')
}
