import { CSSProperties, ReactNode } from 'react'
import { Duration } from 'date-fns'

import { ArrowDirections, Devices, IconSizes, Views } from '../constants'

export type ReactChildrenT = {
  children: ReactNode
}

export type CommonStylesT = {
  sx?: CSSProperties
  className?: string
}

export type ValueOF<T extends string> = `${T}`

export type ButtonStylesT = 'primary' | 'secondary'

export type IconsT = {
  sx?: CSSProperties
  size?: ValueOF<IconSizes>
  onClick?: () => void
  color?: string
}

export type DirectionT<T extends string> = {
  direction?: ValueOF<T>
}

export type ArrowIconT = IconsT & DirectionT<ArrowDirections>

export type WeekStartsOnType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined

export type CalendarEventType = {
  id: string
  title: string
  start: string
  end: string
  overlapping?: number
  color?: string
  textColor?: string
  opacity?: number
}

export type WeekRowsType = {
  time: string
  cells: WeekCellType[][]
}

export type DayRowsType = {
  time: string
  cells: DayCellType[][]
}

export type MonthRowsT = {
  date: Date
  isCurrentMonth: boolean
  slots: CellT[]
}

export type CellT = CalendarEventType & {
  duration?: Duration
}

export type WeekCellType = CellT

export type DayCellType = CellT

export type MonthCellType = CellT

export type EventComponentProps = {
  event: CalendarEventType
  isSelected: boolean
  className: string
}

export type HandleClickOnCellT = {
  events: CalendarEventType[]
  time: string
  day: Date
  onClick: (time: string, day: Date) => void
}

export type OnCellClickT = {
  time: string
  day: Date
}

export type UserClickEvent<EventT> = {
  onEventClick: (event: EventT) => void
}

export type UserEvents<EventT> = UserClickEvent<EventT> & {
  onCellClick: (a: OnCellClickT) => void
}

type EventModalT<EventT> = EventT & {
  onClose: () => void
}

export type NewEventModalT = OnCellClickT & {
  onClose: () => void
}

export type ModalsT<EventT> = {
  eventModal?: (a: EventModalT<EventT>) => ReactNode
  newEventModal?: (a: NewEventModalT) => ReactNode
}

export type ConfigT = {
  maxWidth: number
  mode?: ValueOF<Devices>
  view?: ViewsT
}

export type ViewsT = ValueOF<Views>

export type ModesT = ValueOF<Devices>

export type WeekDayRoesT = WeekRowsType & DayRowsType
