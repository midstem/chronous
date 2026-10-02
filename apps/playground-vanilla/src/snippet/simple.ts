import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous'
import type { EventData } from '@midstem/playground-core'

import { eventLines, rangeLines } from './preamble'

export const simpleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const isSlotted = range.view !== 'month' && range.view !== 'agenda'

  return [
    "import 'temporal-polyfill/global'",
    "import { buildCalendar, formatIso } from '@midstem/chronous'",
    "import type { CalendarRange, EventInput } from '@midstem/chronous'",
    '',
    'type EventData = { title: string }',
    '',
    `const LOCALE = '${locale}'`,
    '',
    'const RANGE: CalendarRange = {',
    rangeLines(range),
    '}',
    '',
    `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
    '',
    'export const renderCalendar = (container: HTMLElement): void => {',
    '  const calendar = buildCalendar(RANGE, EVENTS)',
    '',
    isSlotted
      ? `  const dayHeight = ${hourHeight * 24}
  const cols = \`66px repeat(\${calendar.days.length}, minmax(0, 1fr))\`

  const headings = calendar.days
    .map(
      (d) =>
        \`<div class="border-l border-slate-200 py-2 text-center text-sm font-medium">\${formatIso(d.date, { locale: LOCALE, options: { weekday: 'short', day: 'numeric' } })}</div>\`
    )
    .join('')

  const columns = calendar.days
    .map((d) => {
      const boxes = d.boxes
        .map(
          (b) =>
            \`<div style="position: absolute; top: \${b.top * 100}%; height: \${b.height * 100}%; left: \${b.left * 100}%; width: \${b.width * 100}%;" class="truncate rounded bg-violet-700 px-1.5 text-xs text-white">\${b.event.data?.title ?? b.event.id}</div>\`
        )
        .join('')
      return \`<div class="border-l border-slate-200" style="position: relative; height: \${dayHeight}px;">\${boxes}</div>\`
    })
    .join('')

  container.innerHTML = \`
    <div class="h-full overflow-auto rounded-xl border border-slate-200 bg-white">
      <div style="display: grid; grid-template-columns: \${cols};" class="sticky top-0 border-b border-slate-200 bg-white">
        <div></div>
        \${headings}
      </div>
      <div style="display: grid; grid-template-columns: \${cols};">
        <div style="height: \${dayHeight}px;"></div>
        \${columns}
      </div>
    </div>\`
}`
      : range.view === 'month'
        ? `  let taken = 0
  const rows = calendar.rows.map((row) => {
    const days = calendar.days.slice(taken, taken + row.dayCount)
    taken += row.dayCount
    return { row, days }
  })

  const rowsHtml = rows
    .map(({ days }) => {
      const daysHtml = days
        .map(
          (d) =>
            \`<div class="min-h-28 border-l border-slate-200 p-1">\${formatIso(d.date, { locale: LOCALE, options: { day: 'numeric' } })}</div>\`
        )
        .join('')
      return \`<div class="border-b border-slate-200 last:border-b-0" style="display: grid; grid-template-columns: repeat(\${days.length}, minmax(0, 1fr));">\${daysHtml}</div>\`
    })
    .join('')

  container.innerHTML = \`<div class="h-full overflow-auto rounded-xl border border-slate-200 bg-white">\${rowsHtml}</div>\`
}`
        : `  const items = calendar.days
    .map((d) => {
      const title = formatIso(d.date, { locale: LOCALE, options: { weekday: 'short', day: 'numeric' } })
      const events = d.boxes
        .map((b) => \`<div>\${b.event.data?.title ?? b.event.id}</div>\`)
        .join('')
      return \`<li class="flex gap-4 px-4 py-3"><span class="w-16 font-semibold">\${title}</span><div>\${events}</div></li>\`
    })
    .join('')

  container.innerHTML = \`<ul class="divide-y divide-slate-200">\${items}</ul>\`
}`
  ].join('\n')
}
