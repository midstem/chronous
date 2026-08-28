import type { ReactNode } from 'react'
import { useCalendarContext } from '../context/calendar-context'
import { templateOf } from '../helpers'

export type HeaderProps = {
  children: ReactNode
  className?: string
  gutterWidth?: string
}

export const Header = ({
  children,
  className,
  gutterWidth = '3.25rem'
}: HeaderProps): ReactNode => {
  const { calendar } = useCalendarContext()

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: templateOf(gutterWidth, calendar.days.length)
      }}
    >
      <div />
      {children}
    </div>
  )
}
