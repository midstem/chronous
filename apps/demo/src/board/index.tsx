import type {
  EventInput,
  IsoDate,
  LocaleId,
  CalendarRange
} from '@midstem/chronous-react'
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
  range: CalendarRange
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  density: Density
  style: Style
  onNavigate: (range: CalendarRange) => void
  onDensity: (density: Density) => void
}

type ViewProps = {
  range: CalendarRange
  locale: LocaleId
  today: IsoDate | null
  hourHeight: number
  style: Style
}

const View = ({
  range,
  locale,
  today,
  hourHeight,
  style
}: ViewProps): ReactElement => {
  const plain = isSimple(style)

  if (isSlotted(range.view))
    return plain ? (
      <PlainSlotted hourHeight={hourHeight} />
    ) : (
      <Slotted locale={locale} hourHeight={hourHeight} today={today} />
    )

  if (range.view === MONTH_VIEW)
    return plain ? <PlainMonth /> : <Month today={today} />

  return plain ? <PlainAgenda /> : <Agenda locale={locale} today={today} />
}

export const Board = ({
  range,
  events,
  locale,
  density,
  style,
  onNavigate,
  onDensity
}: BoardProps): ReactElement => {
  const navigation = useCalendarNavigation(range)
  const now = useNow(range.timeZone)
  const today = now?.date ?? null

  const bar = (title: string): ReactElement => (
    <Toolbar
      navigation={navigation}
      title={title}
      view={range.view}
      density={density}
      slotted={isSlotted(range.view)}
      onChange={onNavigate}
      onDensity={onDensity}
    />
  )

  return (
    <Calendar.Root
      range={range}
      events={events}
      locale={locale}
      gutter={GUTTER}
      className="flex min-h-0 flex-1 flex-col p-4"
      fallback={(error) => (
        <>
          {bar(range.date)}
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
                range={range}
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
