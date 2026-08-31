import type {
  EventInput,
  IsoDate,
  LocaleId,
  RangeSpec
} from '@midstem/chronous'
import { useCalendarNavigation, useNow } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { Agenda } from '../agenda'
import { Calendar } from '../calendar'
import type { Density } from '../density'
import { hourHeightOf } from '../density'
import { GUTTER, Slotted } from '../grid'
import { Month } from '../month'
import { PlainAgenda, PlainMonth, PlainSlotted } from '../plain'
import { State } from '../state'
import { isSimple } from '../style'
import type { Style } from '../style'
import { Toolbar } from '../toolbar'
import type { EventData } from '../types'

import { MONTH_VIEW } from './constants'
import { isSlotted, titleOf } from './helpers'

type BoardProps = {
  spec: RangeSpec
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  density: Density
  style: Style
  onNavigate: (spec: RangeSpec) => void
  onDensity: (density: Density) => void
}

type ViewProps = {
  spec: RangeSpec
  locale: LocaleId
  today: IsoDate | null
  hourHeight: number
  style: Style
}

const View = ({
  spec,
  locale,
  today,
  hourHeight,
  style
}: ViewProps): ReactElement => {
  const plain = isSimple(style)

  if (isSlotted(spec.view))
    return plain ? (
      <PlainSlotted hourHeight={hourHeight} />
    ) : (
      <Slotted locale={locale} hourHeight={hourHeight} today={today} />
    )

  if (spec.view === MONTH_VIEW)
    return plain ? <PlainMonth /> : <Month today={today} />

  return plain ? <PlainAgenda /> : <Agenda locale={locale} today={today} />
}

export const Board = ({
  spec,
  events,
  locale,
  density,
  style,
  onNavigate,
  onDensity
}: BoardProps): ReactElement => {
  const navigation = useCalendarNavigation(spec)
  const now = useNow(spec.timeZone)
  const today = now?.date ?? null

  const bar = (title: string): ReactElement => (
    <Toolbar
      navigation={navigation}
      title={title}
      view={spec.view}
      density={density}
      slotted={isSlotted(spec.view)}
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
              <View
                spec={spec}
                locale={locale}
                today={today}
                hourHeight={hourHeightOf(density)}
                style={style}
              />
            </div>

            <State calendar={calendar} />
          </section>
        </>
      )}
    </Calendar.Root>
  )
}

export { MONTH_VIEW, SLOTTED_VIEWS } from './constants'
