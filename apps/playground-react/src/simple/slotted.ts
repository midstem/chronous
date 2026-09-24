export const slottedHelpers = (hourHeight: number): readonly string[] => [
  `const HOUR_HEIGHT = ${hourHeight}`,
  ''
]

export const SLOTTED_BODY: readonly string[] = [
  '    <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900">',
  '      <Calendar.Header className="border-b border-zinc-200 dark:border-zinc-700">',
  '        <Calendar.DayHeadings className="border-l border-zinc-100 py-2 text-center text-sm font-medium dark:border-zinc-800" />',
  '      </Calendar.Header>',
  '',
  '      <Calendar.AllDayRow',
  '        className="border-b border-zinc-200 dark:border-zinc-700"',
  '        gutterCell={<span className="pl-2 text-[10px] text-zinc-400">all-day</span>}',
  '      >',
  '        <Calendar.AllDayEvents className="truncate rounded bg-violet-700 px-2 text-[11px] leading-6 text-white">',
  '          {({ event }) => event.data?.title}',
  '        </Calendar.AllDayEvents>',
  '      </Calendar.AllDayRow>',
  '    </div>',
  '',
  '    <Calendar.TimeGrid hourHeight={HOUR_HEIGHT}>',
  '      <Calendar.TimeAxis>',
  '        <Calendar.TimeLabels className="right-2 text-[10px] text-zinc-400" />',
  '      </Calendar.TimeAxis>',
  '',
  '      <Calendar.DayColumns className="border-l border-zinc-100 dark:border-zinc-800">',
  '        <Calendar.TimeSlots className="border-t border-zinc-100 dark:border-zinc-800" />',
  '',
  '        <Calendar.TimedEvents className="truncate rounded-md bg-blue-700 px-1.5 text-[11px] leading-[1.35] font-medium text-white">',
  '          {({ event }) => event.data?.title}',
  '        </Calendar.TimedEvents>',
  '      </Calendar.DayColumns>',
  '    </Calendar.TimeGrid>'
]
