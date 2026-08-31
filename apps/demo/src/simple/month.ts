export const MONTH_HELPERS: readonly string[] = []

export const MONTH_BODY: readonly string[] = [
  '    <Calendar.MonthGrid>',
  '      <Calendar.MonthRows className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-700">',
  '        <Calendar.MonthDays className="min-h-28 border-l border-zinc-100 p-1 first:border-l-0 dark:border-zinc-800 data-[in-period=false]:bg-zinc-50 data-[in-period=false]:text-zinc-400">',
  '          {({ dayNumber }) => (',
  '            <>',
  '              <div className="text-center text-xs font-medium">{dayNumber}</div>',
  '              <Calendar.MonthEntries className="truncate rounded bg-blue-700 px-1 text-[11px] leading-5 text-white">',
  '                {({ event }) => event.data?.title}',
  '              </Calendar.MonthEntries>',
  '            </>',
  '          )}',
  '        </Calendar.MonthDays>',
  '',
  '        <Calendar.MonthBars className="truncate rounded bg-violet-700 px-1.5 text-[11px] leading-5 text-white">',
  '          {({ event }) => event.data?.title}',
  '        </Calendar.MonthBars>',
  '      </Calendar.MonthRows>',
  '    </Calendar.MonthGrid>'
]
