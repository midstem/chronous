export const FILE_NAME = 'calendar.js'

export const SNIPPET_HINT =
  'Runnable JavaScript module: install @midstem/chronous and temporal-polyfill, load Tailwind CSS v4, add #root, then paste and run. The module sizes #root to the viewport.'

export const SIMPLE_HINT =
  'A short JavaScript example that builds the same view and shows timed and all-day events with plain DOM. It sizes #root to the viewport.'

export const RANGE_INDENT = '  '

export const badgeOf = (
  view: string,
  hourHeight: number,
  locale: string,
  count: number
): string => `${view} · ${hourHeight}px per hour · ${locale} · ${count} events`

export const simpleBadgeOf = (view: string, count: number): string =>
  `${view} · ${count} events · DOM only`
