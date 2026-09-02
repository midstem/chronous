export const AGENDA_HELPERS: readonly string[] = []

export const AGENDA_BODY: readonly string[] = [
  '    <Calendar.AgendaList as="ul" className="divide-y divide-zinc-100 dark:divide-zinc-800">',
  '      <Calendar.AgendaDays as="li" className="flex gap-4 px-4 py-3">',
  '        {({ dayLabel, weekdayLabel }) => (',
  '          <>',
  '            <span className="w-16 shrink-0 text-sm font-semibold">',
  '              {weekdayLabel} {dayLabel}',
  '            </span>',
  '',
  '            <span className="flex flex-col gap-1">',
  '              <Calendar.AgendaAllDayEvents as="span" className="text-[13px]">',
  '                {({ event }) => `${event.data?.title} · all-day`}',
  '              </Calendar.AgendaAllDayEvents>',
  '',
  '              <Calendar.AgendaTimedEvents as="span" className="text-[13px]">',
  '                {({ event, timeRangeLabel }) => `${event.data?.title} · ${timeRangeLabel}`}',
  '              </Calendar.AgendaTimedEvents>',
  '            </span>',
  '          </>',
  '        )}',
  '      </Calendar.AgendaDays>',
  '    </Calendar.AgendaList>'
]
