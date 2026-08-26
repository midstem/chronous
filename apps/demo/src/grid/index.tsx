import type { CalendarBox, CalendarDay, LocaleId } from '@midstem/chronous'
import { useEffect, useRef } from 'react'
import type { ReactElement } from 'react'

import { CONTINUES, PERCENT } from '../constants'
import { dayLabel, numberLabel, timeLabel, weekdayLabel } from '../labels'
import type { Now } from '../now'
import { toneOf } from '../tone'
import type { EventData } from '../types'

import {
  BOX_GAP,
  COMPACT_BOX_HEIGHT,
  HOURS_IN_DAY,
  MIN_BOX_HEIGHT,
  SCROLL_MARGIN,
  SCROLL_TO_HOUR
} from './constants'
import { fractionOf, templateOf, wallTimeOn } from './helpers'

type GridProps = {
  days: readonly CalendarDay<EventData>[]
  locale: LocaleId
  hourHeight: number
  now: Now | null
}

type BoxProps = {
  box: CalendarBox<EventData>
  locale: LocaleId
  dayHeight: number
}

const edge = (shown: boolean): string => (shown ? CONTINUES : '')

const Box = ({ box, locale, dayHeight }: BoxProps): ReactElement => {
  const title = box.event.data?.title ?? box.event.id
  const from = timeLabel(box.start, locale)
  const to = timeLabel(box.end, locale)
  const compact = box.height * dayHeight < COMPACT_BOX_HEIGHT

  return (
    <div
      className={`absolute overflow-hidden rounded-md border border-surface px-1.5 py-px text-[11px] leading-[1.35] shadow-sm transition-[filter] hover:z-20 hover:brightness-110 ${toneOf(box.event.id)}`}
      style={{
        top: `${box.top * PERCENT}%`,
        height: `${box.height * PERCENT}%`,
        left: `${box.left * PERCENT}%`,
        width: `calc(${box.width * PERCENT}% - ${BOX_GAP}px)`,
        minHeight: MIN_BOX_HEIGHT
      }}
      title={`${title}\n${from} – ${to}`}
    >
      <span className="block truncate font-semibold">
        {edge(box.continuesBefore)}
        {title}
        {edge(box.continuesAfter)}
      </span>
      {!compact && (
        <span className="block truncate opacity-80">
          {from} – {to}
        </span>
      )}
    </div>
  )
}

export const Grid = ({
  days,
  locale,
  hourHeight,
  now
}: GridProps): ReactElement => {
  const body = useRef<HTMLDivElement>(null)
  const dayHeight = hourHeight * HOURS_IN_DAY
  const template = templateOf(days.length)

  useEffect(() => {
    const scroller = body.current?.closest('[data-scroller]')

    scroller?.scrollTo({ top: hourHeight * SCROLL_TO_HOUR - SCROLL_MARGIN })
  }, [hourHeight])

  return (
    <div ref={body} className="grid" style={{ gridTemplateColumns: template }}>
      <div className="relative" style={{ height: dayHeight }}>
        {days[0].slots.map((slot) => (
          <span
            key={slot.minuteOfDay}
            className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-faint"
            style={{ top: `${fractionOf(slot.minuteOfDay) * PERCENT}%` }}
          >
            {slot.minuteOfDay > 0 &&
              timeLabel(wallTimeOn(days[0].date, slot.minuteOfDay), locale)}
          </span>
        ))}
      </div>

      {days.map((day) => (
        <div
          key={day.date}
          className="relative border-l border-hair"
          style={{ height: dayHeight }}
        >
          {day.slots.map((slot) => (
            <span
              key={slot.minuteOfDay}
              className="absolute inset-x-0 border-t border-hair"
              style={{ top: `${fractionOf(slot.minuteOfDay) * PERCENT}%` }}
            />
          ))}

          {now?.date === day.date && (
            <span
              className="absolute inset-x-0 z-10 border-t-2 border-now"
              style={{ top: `${fractionOf(now.minuteOfDay) * PERCENT}%` }}
            >
              <span className="absolute -top-[5px] -left-1 size-2 rounded-full bg-now" />
            </span>
          )}

          {day.boxes.map((box) => (
            <Box
              key={`${box.event.id}-${box.startMinute}`}
              box={box}
              locale={locale}
              dayHeight={dayHeight}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

type HeadProps = {
  days: readonly CalendarDay<EventData>[]
  locale: LocaleId
  today: string | null
}

export const GridHead = ({ days, locale, today }: HeadProps): ReactElement => (
  <div
    className="grid border-b border-line"
    style={{ gridTemplateColumns: templateOf(days.length) }}
  >
    <div />
    {days.map((day) => (
      <div
        key={day.date}
        className="flex flex-col items-center gap-0.5 border-l border-hair py-2"
        title={dayLabel(day.date, locale)}
      >
        <span className="text-[10px] font-medium tracking-wide text-muted uppercase">
          {weekdayLabel(day.date, locale)}
        </span>
        <span
          className={
            day.date === today
              ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
              : 'flex size-7 items-center justify-center text-sm font-semibold'
          }
        >
          {numberLabel(day.date, locale)}
        </span>
      </div>
    ))}
  </div>
)

export { templateOf } from './helpers'
