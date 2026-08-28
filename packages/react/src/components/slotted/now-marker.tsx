import type { ReactNode } from 'react'
import { useCalendarContext } from '../context/calendar-context'
import { useDayColumnContext } from '../context/day-column-context'
import { fractionOf } from '../helpers'
import { useNow } from './use-now'

export type NowMarkerProps = {
  children?: (ctx: { minuteOfDay: number }) => ReactNode
  className?: string
}

export const NowMarker = ({
  children,
  className
}: NowMarkerProps): ReactNode => {
  const { spec } = useCalendarContext()
  const { day } = useDayColumnContext()
  const now = useNow(spec.timeZone)

  if (now?.date !== day.date) return null

  const top = `${fractionOf(now.minuteOfDay) * 100}%`
  const ctx = { minuteOfDay: now.minuteOfDay }

  return (
    <div
      className={className}
      style={{ position: 'absolute', top, left: 0, right: 0, zIndex: 10 }}
    >
      {typeof children === 'function' ? (
        children(ctx)
      ) : (
        <span className={className} />
      )}
    </div>
  )
}
