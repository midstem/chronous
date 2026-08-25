import type { Calendar } from '@midstem/chronous'

import { JSON_INDENT } from '../constants'

import { MAX_JSON_LENGTH, TRUNCATION_NOTICE } from './constants'
import type { Metric } from './types'

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0)

export const summaryOf = <TData>(
  calendar: Calendar<TData>
): readonly Metric[] => [
  { label: 'view', value: calendar.view },
  { label: 'start', value: calendar.start },
  { label: 'end', value: calendar.end },
  { label: 'days', value: String(calendar.days.length) },
  { label: 'rows', value: String(calendar.rows.length) },
  {
    label: 'slots',
    value: String(sum(calendar.days.map((day) => day.slots.length)))
  },
  {
    label: 'boxes',
    value: String(sum(calendar.days.map((day) => day.boxes.length)))
  },
  {
    label: 'bars',
    value: String(sum(calendar.rows.map((row) => row.bars.length)))
  }
]

export const jsonOf = <TData>(calendar: Calendar<TData>): string => {
  const text = JSON.stringify(calendar, null, JSON_INDENT)

  return text.length > MAX_JSON_LENGTH
    ? `${text.slice(0, MAX_JSON_LENGTH)}${TRUNCATION_NOTICE}`
    : text
}
