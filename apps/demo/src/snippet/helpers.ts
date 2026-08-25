import type { LocaleId, RangeSpec } from '@midstem/chronous'

import { SPEC_INDENT } from './constants'

const literal = (value: unknown): string =>
  typeof value === 'number' ? String(value) : `'${String(value)}'`

const lines = (spec: RangeSpec): string =>
  Object.entries(spec)
    .map(([key, value]) => `${SPEC_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

export const snippetOf = (spec: RangeSpec, locale: LocaleId): string =>
  [
    "import { formatIso } from '@midstem/chronous'",
    "import { useCalendar, useCalendarNavigation } from '@midstem/chronous-react'",
    '',
    'const spec = {',
    lines(spec),
    '}',
    '',
    'const Board = ({ events }) => {',
    '  const { calendar, error } = useCalendar(spec, events)',
    '  const navigation = useCalendarNavigation(calendar, spec)',
    '',
    '  if (error) return <p>{error.message}</p>',
    '',
    '  return calendar.days.map((day) => (',
    '    <section key={day.date}>',
    `      <h2>{formatIso(day.date, { locale: '${locale}' })}</h2>`,
    '      {day.boxes.map((box) => (',
    '        <article key={box.event.id} style={{ top: box.top, height: box.height }}>',
    '          {box.event.data.title}',
    '        </article>',
    '      ))}',
    '    </section>',
    '  ))',
    '}'
  ].join('\n')
