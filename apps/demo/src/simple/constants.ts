export const FILE_NAME = 'Calendar.tsx'

export const SIMPLE_HINT =
  'The same board with everything optional taken out: no toolbar, no navigation, no colour palette, no helper functions — one component that reads the spec, walks what buildCalendar returned and lays it out with Tailwind classes. Start here, then reach for the full version when you want the rest.'

export const SPEC_INDENT = '  '

export const HOURS_IN_DAY = 24

export const KEY_PATTERN = /"([A-Za-z][\w]*)":/g

export const KEY_REPLACEMENT = '$1:'

export const badgeOf = (view: string, count: number): string =>
  `${view} · ${count} events · no helpers`
