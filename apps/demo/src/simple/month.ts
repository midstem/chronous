export const MONTH_HELPERS: readonly string[] = ['const LANE_HEIGHT = 20', '']

export const MONTH_BODY: readonly string[] = [
  '    <Calendar.MonthGrid>',
  '      <Calendar.MonthRows className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-700">',
  '        <Calendar.MonthDays className="min-h-28 border-l border-zinc-100 p-1 first:border-l-0 dark:border-zinc-800 data-[in-period=false]:bg-zinc-50 data-[in-period=false]:text-zinc-400">',
  '          {({ dayNumber, lanes }) => (',
  '            <>',
  '              <div className="h-7 text-center text-xs font-medium">',
  '                {dayNumber}',
  '              </div>',
  '              <div style={{ height: lanes * LANE_HEIGHT }} />',
  '              <Calendar.MonthEntries className="truncate rounded bg-blue-700 px-1 text-[11px] leading-5 text-white">',
  '                {({ event }) => event.data?.title}',
  '              </Calendar.MonthEntries>',
  '            </>',
  '          )}',
  '        </Calendar.MonthDays>',
  '',
  '        <Calendar.MonthBars',
  '          laneHeight={LANE_HEIGHT}',
  '          className="truncate rounded bg-violet-700 px-1.5 text-[11px] leading-5 text-white"',
  '        >',
  '          {({ event }) => event.data?.title}',
  '        </Calendar.MonthBars>',
  '      </Calendar.MonthRows>',
  '    </Calendar.MonthGrid>'
]
