import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import { SLOTTED_VIEWS } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { AGENDA_BODY } from './agenda'
import { MONTH_BODY, MONTH_HELPERS } from './month'
import { preambleOf } from './preamble'
import { FULL_CLOSING, OPENING } from './shell'
import { SLOTTED_BODY, slottedHelpers } from './slotted'

const rendererOf = (
  view: CalendarRange['view'],
  hourHeight: number
): {
  body: readonly string[]
  helpers: readonly string[]
  clock: boolean
  today: boolean
  month: boolean
} =>
  SLOTTED_VIEWS.includes(view)
    ? {
        body: SLOTTED_BODY,
        helpers: slottedHelpers(hourHeight),
        clock: true,
        today: false,
        month: false
      }
    : view === 'month'
      ? {
          body: MONTH_BODY,
          helpers: MONTH_HELPERS,
          clock: false,
          today: true,
          month: true
        }
      : {
          body: AGENDA_BODY,
          helpers: [],
          clock: false,
          today: true,
          month: false
        }

export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const renderer = rendererOf(range.view, hourHeight)
  return [
    ...preambleOf(range, events, locale, renderer.clock, renderer.today),
    ...renderer.helpers,
    ...OPENING,
    ...renderer.body,
    ...FULL_CLOSING(renderer)
  ].join('\n')
}
