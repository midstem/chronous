export const MONTH_HELPERS: readonly string[] = ['const LANE_HEIGHT = 20', '']

export const MONTH_BODY: readonly string[] = [
  '    <Calendar.MonthGrid>',
  '      <Calendar.MonthRows',
  '        className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-700"',
  '        laneHeight={LANE_HEIGHT}',
  '      >',
  '        <Calendar.MonthDays className="min-h-28 border-l border-zinc-100 p-1 first:border-l-0 dark:border-zinc-800 data-[in-current-period=false]:bg-zinc-50 data-[in-current-period=false]:text-zinc-400">',
  '          {({ dayLabel, lanes }) => (',
  '            <>',
  '              <div className="h-7 text-center text-xs font-medium">',
  '                {dayLabel}',
  '              </div>',
  '              <div style={{ height: lanes * LANE_HEIGHT }} />',
  '              <Calendar.MonthTimedEvents className="truncate rounded bg-blue-700 px-1 text-[11px] leading-5 text-white">',
  '                {({ event }) => event.data?.title}',
  '              </Calendar.MonthTimedEvents>',
  '            </>',
  '          )}',
  '        </Calendar.MonthDays>',
  '',
  '        <Calendar.MonthAllDayEvents className="truncate rounded bg-violet-700 px-1.5 text-[11px] leading-5 text-white">',
  '          {({ event }) => event.data?.title}',
  '        </Calendar.MonthAllDayEvents>',
  '      </Calendar.MonthRows>',
  '    </Calendar.MonthGrid>'
]
