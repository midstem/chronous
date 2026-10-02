import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'

import type { EventData } from '../types'

import { AGENDA_BODY } from './agenda'
import { MONTH_BODY, MONTH_HELPERS } from './month'
import { preambleOf } from './preamble'
import { CLOSING, OPENING } from './shell'
import { SLOTTED_BODY, slottedHelpers } from './slotted'

const helpers = (hourHeight: number): readonly string[] => [
  ...slottedHelpers(hourHeight),
  ...MONTH_HELPERS
]

const body: readonly string[] = [
  '          {SLOTTED_VIEWS.includes(range.view) ? (',
  '            <>',
  ...SLOTTED_BODY,
  '            </>',
  '          ) : range.view === "month" ? (',
  '            <>',
  ...MONTH_BODY,
  '            </>',
  '          ) : (',
  '            <>',
  ...AGENDA_BODY,
  '            </>',
  '          )}'
]

export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  return [
    ...preambleOf(range, events, locale, { clock: true }),
    ...helpers(hourHeight),
    ...OPENING,
    ...body,
    ...CLOSING
  ].join('\n')
}
