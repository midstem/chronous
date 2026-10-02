import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'
import { SLOTTED_VIEWS } from '@midstem/playground-core'

import type { EventData } from '../types'

import { AGENDA_BODY } from './agenda'
import { MONTH_BODY, MONTH_HELPERS } from './month'
import { preambleOf } from './preamble'
import { CLOSING, OPENING } from './shell'
import { SLOTTED_BODY, slottedHelpers } from './slotted'

const rendererOf = (
  view: CalendarRange['view'],
  hourHeight: number
): {
  body: readonly string[]
  helpers: readonly string[]
  clock: boolean
  today: boolean
} =>
  SLOTTED_VIEWS.includes(view)
    ? {
        body: SLOTTED_BODY,
        helpers: slottedHelpers(hourHeight),
        clock: true,
        today: false
      }
    : view === 'month'
      ? { body: MONTH_BODY, helpers: MONTH_HELPERS, clock: false, today: true }
      : { body: AGENDA_BODY, helpers: [], clock: false, today: true }

export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const renderer = rendererOf(range.view, hourHeight)
  return [
    ...preambleOf(range, events, locale, {
      clock: renderer.clock,
      today: renderer.today
    }),
    ...renderer.helpers,
    ...OPENING.slice(0, 2),
    ...(renderer.today
      ? ['  const today = useNow(range.timeZone)?.date ?? null']
      : []),
    ...OPENING.slice(2),
    ...renderer.body,
    ...CLOSING
  ].join('\n')
}
