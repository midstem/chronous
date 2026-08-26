export const OPENING: readonly string[] = [
  'export const Calendar = () => {',
  '  const { calendar, error } = useCalendar<EventData>(SPEC, EVENTS)',
  '',
  '  if (error)',
  '    return <p className="p-4 text-sm text-red-700">{error.message}</p>',
  ''
]

export const CLOSING: readonly string[] = ['}']
