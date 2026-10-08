import type { ReactElement } from 'react'
import type { ChronousCalendarEventColor } from './calendar'

const EVENT_TONES: Record<ChronousCalendarEventColor, string> = {
  'chart-1': 'bg-chart-1/10 border-chart-1/25 border-l-2 border-l-chart-1',
  'chart-2': 'bg-chart-2/10 border-chart-2/25 border-l-2 border-l-chart-2',
  'chart-3': 'bg-chart-3/10 border-chart-3/25 border-l-2 border-l-chart-3',
  'chart-4': 'bg-chart-4/10 border-chart-4/25 border-l-2 border-l-chart-4',
  'chart-5': 'bg-chart-5/10 border-chart-5/25 border-l-2 border-l-chart-5'
}

const eventTone = (color: ChronousCalendarEventColor = 'chart-2'): string =>
  EVENT_TONES[color]

type EventPillProps = {
  color?: ChronousCalendarEventColor
  title: string
  time?: string
  size: 'week' | 'month'
}

export const EventPill = ({
  color,
  title,
  time,
  size
}: EventPillProps): ReactElement => (
  <span
    className={`${
      size === 'week'
        ? 'inline-flex h-6 w-full items-center gap-2 truncate rounded border px-2 text-foreground'
        : 'flex h-[22px] w-full items-center gap-1.5 truncate rounded border px-1.5 text-[10px] text-foreground'
    } ${eventTone(color)}`}
  >
    {time && (
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {time}
      </span>
    )}
    <span className="truncate">{title}</span>
  </span>
)

type EventCardProps = {
  color?: ChronousCalendarEventColor
  title: string
  time?: string
  size: 'week' | 'agenda'
}

export const EventCard = ({
  color,
  title,
  time,
  size
}: EventCardProps): ReactElement => (
  <div
    className={`${
      size === 'week'
        ? 'flex h-full w-full min-w-0 flex-col items-start justify-start overflow-hidden rounded-md border px-2 py-1 text-foreground'
        : 'flex min-w-0 flex-col items-start rounded-lg border px-3 py-2 text-foreground'
    } ${eventTone(color)}`}
  >
    <p
      className={`truncate font-medium ${size === 'week' ? 'text-xs' : 'text-sm'}`}
    >
      {title}
    </p>
    {time && (
      <p
        className={`truncate text-muted-foreground ${size === 'week' ? 'text-[10px] leading-tight' : 'text-xs'}`}
      >
        {time}
      </p>
    )}
  </div>
)

export const NowMarker = (): ReactElement => (
  <>
    <span className="absolute -left-1.5 top-0 size-3 -translate-y-1/2 rounded-full border-2 border-background bg-red-500" />
    <span className="absolute left-0 right-0 top-0 h-px bg-red-500" />
  </>
)
