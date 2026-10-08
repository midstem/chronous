import type { ChronousCalendarView } from '@/components/ui/chronous-calendar'

import { DEFAULT_LOCALE, VIEWS } from './constants'
import type { PlaygroundSettings } from './types'

const isView = (value: string | null): value is ChronousCalendarView =>
  VIEWS.some((view) => view === value)

export const readSettings = (search: string): PlaygroundSettings => {
  const params = new URLSearchParams(search)
  const view = params.get('view')

  return {
    view: isView(view) ? view : undefined,
    date: params.get('date') ?? undefined,
    timeZone: params.get('tz') ?? undefined,
    locale: params.get('locale') ?? DEFAULT_LOCALE,
    withEvents: params.get('events') !== 'none'
  }
}

export const todayIn = (timeZone: string | undefined): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())
