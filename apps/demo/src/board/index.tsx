import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import { useCalendarNavigation, useNow } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { Agenda } from '../agenda'
import { Calendar } from '../calendar'
import type { Density } from '../density'
import { hourHeightOf } from '../density'
import { GUTTER, Slotted } from '../grid'
import { Month } from '../month'
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
  const navigation = useCalendarNavigation(spec)
  const now = useNow(spec.timeZone)
  const today = now?.date ?? null
  const slotted = isSlotted(spec.view)

  const bar = (title: string): ReactElement => (
    <Toolbar
      navigation={navigation}
      title={title}
      view={spec.view}
      density={density}
      slotted={slotted}
      onChange={onNavigate}
      onDensity={onDensity}
    />
  )

  return (
    <Calendar.Root
      spec={spec}
      events={events}
      locale={locale}
      gutter={GUTTER}
      className="flex min-h-0 flex-1 flex-col p-4"
      fallback={(error) => (
        <>
          {bar(spec.date)}
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            <strong className="font-mono">{error.name}</strong>: {error.message}
          </p>
        </>
      )}
    >
      {({ calendar }) => (
        <>
          {bar(titleOf(calendar, locale))}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <div data-scroller className="min-h-0 flex-1 overflow-auto">
              {slotted && (
                <Slotted
                  locale={locale}
                  hourHeight={hourHeightOf(density)}
                  today={today}
                />
              )}

              {!slotted && spec.view === MONTH_VIEW && <Month today={today} />}

              {!slotted && spec.view !== MONTH_VIEW && (
                <Agenda locale={locale} today={today} />
              )}
            </div>

            <State calendar={calendar} />
          </section>
        </>
      )}
    </Calendar.Root>
  )
}

export { MONTH_VIEW, SLOTTED_VIEWS } from './constants'
