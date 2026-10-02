export const slottedHelpers = (hourHeight: number): readonly string[] => [
  `const HOUR_HEIGHT = ${hourHeight}`,
  ''
]

export const SLOTTED_BODY: readonly string[] = [
  '    <div className="sticky top-0 z-10 bg-white dark:bg-slate-950">',
  '      <Calendar.Header className="border-b border-slate-200 dark:border-white/15">',
  '        <Calendar.DayHeadings className="border-l border-slate-100 py-2 text-center text-sm font-medium dark:border-white/5" />',
  '      </Calendar.Header>',
  '',
  '      <Calendar.AllDayRow',
  '        className="border-b border-slate-200 dark:border-white/15"',
  '        gutterCell={<span className="pl-2 text-[10px] text-slate-400">all-day</span>}',
  '      >',
  '        <Calendar.AllDayEvents className="truncate rounded bg-blue-700 px-2 text-[11px] leading-6 text-white dark:bg-blue-300 dark:text-slate-950">',
  '          {({ event }) => event.data?.title ?? event.id}',
  '        </Calendar.AllDayEvents>',
  '      </Calendar.AllDayRow>',
  '    </div>',
  '',
  '    <Calendar.TimeGrid hourHeight={HOUR_HEIGHT}>',
  '      <Calendar.TimeAxis>',
  '        <Calendar.TimeLabels className="right-2 text-[10px] text-slate-400" />',
  '      </Calendar.TimeAxis>',
  '',
  '      <Calendar.DayColumns className="border-l border-slate-100 dark:border-white/5">',
  '        <Calendar.TimeSlots className="border-t border-slate-100 dark:border-white/5" />',
  '',
  '        <Calendar.TimedEvents className="truncate rounded-md bg-violet-700 px-1.5 text-[11px] leading-[1.35] font-medium text-white dark:bg-violet-400 dark:text-slate-950">',
  '          {({ event }) => event.data?.title ?? event.id}',
  '        </Calendar.TimedEvents>',
  '      </Calendar.DayColumns>',
  '    </Calendar.TimeGrid>'
]
