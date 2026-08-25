import type { IsoDate, IsoDateTime } from '@midstem/chronous'

import { CLOCK_PAD_CHAR, CLOCK_PAD_LENGTH, MINUTES_IN_HOUR } from './constants'

const padded = (value: number): string =>
  String(value).padStart(CLOCK_PAD_LENGTH, CLOCK_PAD_CHAR)

export const wallTimeOn = (date: IsoDate, minuteOfDay: number): IsoDateTime =>
  `${date}T${padded(Math.floor(minuteOfDay / MINUTES_IN_HOUR))}:${padded(minuteOfDay % MINUTES_IN_HOUR)}:00`
