import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import { useCalendar, useCalendarNavigation } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { Agenda } from '../agenda'
import { AllDay } from '../allday'
import type { Density } from '../density'
import { hourHeightOf } from '../density'
import { Grid, GridHead } from '../grid'
import { Month } from '../month'
import { useNow } from '../now'
import { State } from '../state'
import { Toolbar } from '../toolbar'
import type { EventData } from '../types'

import { MONTH_VIEW } from './constants'
import { isSlotted, titleOf } from './helpers'

type BoardProps = {
  spec: RangeSpec
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  density: Density
  onNavigate: (spec: RangeSpec) => void
  onDensity: (density: Density) => void
}

export const Board = ({
  spec,
  events,
  locale,
  density,
  onNavigate,
  onDensity
}: BoardProps): ReactElement => {
  const { calendar, error } = useCalendar<EventData>(spec, events)
  const navigation = useCalendarNavigation(spec)
  const now = useNow(spec.timeZone)
  const slotted = isSlotted(spec.view)
  const today = now?.date ?? null

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <Toolbar
        navigation={navigation}
        title={calendar ? titleOf(calendar, locale) : spec.date}
        view={spec.view}
        density={density}
        slotted={slotted}
        onChange={onNavigate}
        onDensity={onDensity}
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <strong className="font-mono">{error.name}</strong>: {error.message}
        </p>
      )}

      {calendar && (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div data-scroller className="min-h-0 flex-1 overflow-auto">
            {slotted && calendar.days[0].slots.length > 0 && (
              <>
                <div className="sticky top-0 z-30 bg-surface">
                  <GridHead
                    days={calendar.days}
                    locale={locale}
                    today={today}
                  />
                  {calendar.rows[0] && (
                    <AllDay
                      row={calendar.rows[0]}
                      columns={calendar.days.length}
                    />
                  )}
                </div>
                <Grid
                  days={calendar.days}
                  locale={locale}
                  hourHeight={hourHeightOf(density)}
                  now={now}
                />
              </>
            )}

            {!slotted && spec.view === MONTH_VIEW && (
              <Month calendar={calendar} locale={locale} today={today} />
            )}

            {!slotted && spec.view !== MONTH_VIEW && (
              <Agenda calendar={calendar} locale={locale} today={today} />
            )}
          </div>

          <State calendar={calendar} />
        </section>
      )}
    </div>
  )
}
