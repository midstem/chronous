export const OPENING: readonly string[] = [
  'export const Board = () => (',
  '  <Calendar.Root',
  '    range={RANGE}',
  '    events={EVENTS}',
  '    locale={LOCALE}',
  '    className="h-full overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"',
  '    fallback={(error) => (',
  '      <p className="p-4 text-sm text-red-700">{error.message}</p>',
  '    )}',
  '  >'
]

export const CLOSING: readonly string[] = ['  </Calendar.Root>', ')']
