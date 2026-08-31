export const AGENDA_HELPERS: readonly string[] = []

export const AGENDA_BODY: readonly string[] = [
  '    <Calendar.AgendaList as="ul" className="divide-y divide-zinc-100 dark:divide-zinc-800">',
  '      <Calendar.AgendaDays as="li" className="flex gap-4 px-4 py-3">',
  '        {({ dayNumber, weekday }) => (',
  '          <>',
  '            <span className="w-16 shrink-0 text-sm font-semibold">',
  '              {weekday} {dayNumber}',
  '            </span>',
  '',
  '            <span className="flex flex-col gap-1">',
  '              <Calendar.AgendaBars as="span" className="text-[13px]">',
  '                {({ event }) => `${event.data?.title} · all-day`}',
  '              </Calendar.AgendaBars>',
  '',
  '              <Calendar.AgendaBoxes as="span" className="text-[13px]">',
  '                {({ event, timeRange }) => `${event.data?.title} · ${timeRange}`}',
  '              </Calendar.AgendaBoxes>',
  '            </span>',
  '          </>',
  '        )}',
  '      </Calendar.AgendaDays>',
  '    </Calendar.AgendaList>'
]
