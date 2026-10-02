export const FILE_NAME = 'calendar.ts'

export const SNIPPET_HINT =
  'The board on the Calendar tab, as one file: the same range, the same events and the same row height, built with buildCalendar and rendered with standard DOM. Install @midstem/chronous, paste, run.'

export const SIMPLE_HINT =
  'The same calendar, built with buildCalendar and plain DOM: no palette, no helper functions, no toolbar. The place to start reading.'

export const RANGE_INDENT = '  '

export const KEY_PATTERN = /"([A-Za-z][\w]*)":/g

export const KEY_REPLACEMENT = '$1:'

export const badgeOf = (
  view: string,
  hourHeight: number,
  locale: string,
  count: number
): string => `${view} · ${hourHeight}px per hour · ${locale} · ${count} events`

export const simpleBadgeOf = (view: string, count: number): string =>
  `${view} · ${count} events · DOM only`
