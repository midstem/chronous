export const MONTH_HELPERS: readonly string[] = ['const LANE_HEIGHT = 20', '']

export const MONTH_BODY: readonly string[] = [
  '    <Calendar.MonthGrid>',
  '      <Calendar.MonthRows',
  '        className="border-b border-slate-200 last:border-b-0 dark:border-white/15"',
  '        laneHeight={LANE_HEIGHT}',
  '      >',
  '        <Calendar.MonthDays className="min-h-28 border-l border-slate-100 p-1 first:border-l-0 dark:border-white/5 data-[in-current-period=false]:bg-slate-50 data-[in-current-period=false]:text-slate-400">',
  '          {({ dayLabel, lanes }) => (',
  '            <>',
  '              <div className="h-7 text-center text-xs font-medium">',
  '                {dayLabel}',
  '              </div>',
  '              <div style={{ height: lanes * LANE_HEIGHT }} />',
  '              <Calendar.MonthTimedEvents className="truncate rounded bg-violet-700 px-1 text-[11px] leading-5 text-white dark:bg-violet-400 dark:text-slate-950">',
  '                {({ event }) => event.data?.title}',
  '              </Calendar.MonthTimedEvents>',
  '            </>',
  '          )}',
  '        </Calendar.MonthDays>',
  '',
  '        <Calendar.MonthAllDayEvents className="truncate rounded bg-blue-700 px-1.5 text-[11px] leading-5 text-white dark:bg-blue-300 dark:text-slate-950">',
  '          {({ event }) => event.data?.title}',
  '        </Calendar.MonthAllDayEvents>',
  '      </Calendar.MonthRows>',
  '    </Calendar.MonthGrid>'
]
