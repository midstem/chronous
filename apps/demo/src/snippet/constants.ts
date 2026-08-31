export const FILE_NAME = 'Calendar.tsx'

export const SNIPPET_HINT =
  'The board on the Calendar tab, as one file: the same spec, the same events and the same row height, drawn with the Calendar components and the same Tailwind classes. The dark half of every pair is a dark: variant, so it follows the system in a stock Tailwind v4 project. Install @midstem/chronous and @midstem/chronous-react, paste, render.'

export const SPEC_INDENT = '  '

export const KEY_PATTERN = /"([A-Za-z][\w]*)":/g

export const KEY_REPLACEMENT = '$1:'

export const badgeOf = (
  view: string,
  hourHeight: number,
  locale: string,
  count: number
): string => `${view} · ${hourHeight}px per hour · ${locale} · ${count} events`
