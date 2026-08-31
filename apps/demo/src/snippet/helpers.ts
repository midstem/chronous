import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'

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

const templateOf = (spec: RangeSpec, hourHeight: number): Template => {
  if (SLOTTED_VIEWS.includes(spec.view))
    return {
      needs: { tones: true, clock: true, rowScope: false },
      helpers: slottedHelpers(hourHeight),
      body: SLOTTED_BODY
    }

  if (spec.view === MONTH_VIEW)
    return {
      needs: { tones: true, clock: false, rowScope: true },
      helpers: MONTH_HELPERS,
      body: MONTH_BODY
    }

  return {
    needs: { tones: false, clock: false, rowScope: false },
    helpers: [],
    body: AGENDA_BODY
  }
}

export const snippetOf = (
  spec: RangeSpec,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const { needs, helpers, body } = templateOf(spec, hourHeight)

  return [
    ...preambleOf(spec, events, locale, needs),
    ...helpers,
    ...OPENING,
    ...body,
    ...CLOSING
  ].join('\n')
}
