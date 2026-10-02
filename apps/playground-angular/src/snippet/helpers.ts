import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import type { EventData } from '@midstem/playground-core'

import { AGENDA_BODY } from './agenda'
import { MONTH_BODY, MONTH_HELPERS } from './month'
import { preambleOf } from './preamble'
import { FULL_CLOSING, OPENING } from './shell'
import { SLOTTED_BODY, slottedHelpers } from './slotted'

const helpers = (hourHeight: number): readonly string[] => [
  ...slottedHelpers(hourHeight),
  ...MONTH_HELPERS
]

const body: readonly string[] = [
  '        @if (range().view === "month") {',
  ...MONTH_BODY,
  '        } @else if (range().view === "agenda") {',
  ...AGENDA_BODY,
  '        } @else {',
  ...SLOTTED_BODY,
  '        }'
]

export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  return [
    ...preambleOf(range, events, locale),
    ...helpers(hourHeight),
    ...OPENING,
    ...body,
    ...FULL_CLOSING
  ].join('\n')
}
