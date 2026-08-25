import type { EventId } from '#src/event'
import type { RangeSpec, ViewKind } from '#src/range'
import type { IsoDate, IsoDateTime } from '#src/time'

export type CalendarSelection =
  | { kind: 'event'; id: EventId }
  | { kind: 'slot'; date: IsoDate; minuteOfDay: number }
  | { kind: 'date'; date: IsoDate }

export type CalendarState = {
  spec: RangeSpec
  selection: CalendarSelection | null
}

export type CalendarAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'today'; now: IsoDateTime }
  | { type: 'goto'; date: IsoDate }
  | { type: 'view'; view: ViewKind }
  | { type: 'select'; selection: CalendarSelection }
  | { type: 'clear' }
