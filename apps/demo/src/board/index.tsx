import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import { useCalendar, useCalendarNavigation } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { Grid } from '../grid'
import { titleLabel } from '../labels'
import { Lanes } from '../lanes'
import { State } from '../state'
import { Toolbar } from '../toolbar'
import type { EventData } from '../types'

import { isSlotted, periodDate } from './helpers'

type BoardProps = {
  spec: RangeSpec
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  onNavigate: (spec: RangeSpec) => void
}

export const Board = ({
  spec,
  events,
  locale,
  onNavigate
}: BoardProps): ReactElement => {
  const { calendar, error } = useCalendar<EventData>(spec, events)
  const navigation = useCalendarNavigation(spec)
  const slotted = calendar ? isSlotted(calendar) : false

  return (
    <>
      <Toolbar
        navigation={navigation}
        title={calendar ? titleLabel(periodDate(calendar), locale) : spec.date}
        onChange={onNavigate}
      />

      {error && (
        <p className="error">
          {error.name}: {error.message}
        </p>
      )}

      {calendar && (
        <section className="board">
          <Lanes calendar={calendar} locale={locale} withCells={!slotted} />
          {slotted && <Grid days={calendar.days} locale={locale} />}
        </section>
      )}

      {calendar && <State calendar={calendar} />}
    </>
  )
}
