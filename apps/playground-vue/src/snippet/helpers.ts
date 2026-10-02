import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous-vue'
import type { EventData } from '@midstem/playground-core'

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
  "    <template v-if=\"['day', 'week', 'days'].includes(range.view)\">",
  ...SLOTTED_BODY,
  '    </template>',
  '    <template v-else-if="range.view === \'month\'">',
  ...MONTH_BODY,
  '    </template>',
  '    <template v-else>',
  ...AGENDA_BODY,
  '    </template>'
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
    '</script>',
    '',
    ...OPENING,
    ...body,
    ...CLOSING
  ].join('\n')
}
