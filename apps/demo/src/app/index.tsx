import type { RangeSpec } from '@midstem/chronous'
import { useCalendar, useCalendarNavigation } from '@midstem/chronous-react'
import { useState } from 'react'
import type { ReactElement } from 'react'

import { Grid } from '../grid'
import { titleLabel } from '../labels'
import { Lanes } from '../lanes'
import { Toolbar } from '../toolbar'

import { EVENTS, INITIAL_SPEC, LOCALE } from './constants'
import { isSlotted, periodDate } from './helpers'
import type { EventData } from './types'

export const App = (): ReactElement => {
  const [spec, setSpec] = useState<RangeSpec>(INITIAL_SPEC)
  const { calendar, error } = useCalendar<EventData>(spec, EVENTS)
  const navigation = useCalendarNavigation(calendar, spec)
  const slotted = calendar ? isSlotted(calendar) : false

  return (
    <main className="app">
      <Toolbar
        spec={spec}
        navigation={navigation}
        title={calendar ? titleLabel(periodDate(calendar), LOCALE) : spec.date}
        onChange={setSpec}
      />
      {error && <p className="error">{error.message}</p>}
      {calendar && (
        <section className="board">
          <Lanes calendar={calendar} locale={LOCALE} withCells={!slotted} />
          {slotted && <Grid days={calendar.days} locale={LOCALE} />}
        </section>
      )}
    </main>
  )
}
