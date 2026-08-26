import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'

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

const templateOf = (spec: RangeSpec, hourHeight: number): Template => {
  if (SLOTTED_VIEWS.includes(spec.view))
    return { helpers: slottedHelpers(hourHeight), body: SLOTTED_BODY }

  if (spec.view === MONTH_VIEW)
    return { helpers: MONTH_HELPERS, body: MONTH_BODY }

  return { helpers: AGENDA_HELPERS, body: AGENDA_BODY }
}

export const simpleOf = (
  spec: RangeSpec,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const { helpers, body } = templateOf(spec, hourHeight)

  return [
    ...preambleOf(spec, events, locale),
    ...helpers,
    ...OPENING,
    ...body,
    ...CLOSING
  ].join('\n')
}
