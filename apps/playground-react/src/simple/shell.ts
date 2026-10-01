export const OPENING: readonly string[] = [
  'export const Board = () => (',
  '  <Calendar.Root',
  '    range={RANGE}',
  '    events={EVENTS}',
  '    locale={LOCALE}',
  '    className="h-full overflow-auto rounded-xl border border-slate-200 bg-white dark:border-white/15 dark:bg-slate-950"',
  '    renderError={(error) => (',
  '      <p className="p-4 text-sm text-red-700">{error.message}</p>',
  '    )}',
  '  >'
]

export const CLOSING: readonly string[] = ['  </Calendar.Root>', ')']
