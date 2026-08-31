export const FILE_NAME = 'Calendar.tsx'

export const SIMPLE_HINT =
  'The same board with everything optional taken out: no toolbar, no navigation, no colour palette, no helpers — one tree of Calendar parts with class names on them. Nothing here walks the calendar by hand; that is what the components are for. Start here, then reach for the full version when you want the rest.'

export const RANGE_INDENT = '  '

export const KEY_PATTERN = /"([A-Za-z][\w]*)":/g

export const KEY_REPLACEMENT = '$1:'

export const badgeOf = (view: string, count: number): string =>
  `${view} · ${count} events · components only`
