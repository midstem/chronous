import type { EventInput } from '#src/event'

const MULTIPLIER = 1103515245

const INCREMENT = 12345

const MODULUS = 2147483648

const MINUTES_IN_DAY = 1440

const MIN_DURATION = 15

const DURATION_SPREAD = 105

const SEED = 7

export type BenchEvent = {
  title: string
}

export const HEAVY = { time: 0, iterations: 5 }

const steps = (count: number): number[] => {
  const values: number[] = []

  let seed = SEED

  for (let index = 0; index < count; index += 1) {
    seed = (seed * MULTIPLIER + INCREMENT) % MODULUS
    values.push(seed)
  }

  return values
}

const pad = (value: number): string => String(value).padStart(2, '0')

const dayAfter = (from: string, offset: number): string => {
  const date = new Date(`${from}T00:00:00Z`)

  date.setUTCDate(date.getUTCDate() + offset)

  return date.toISOString().slice(0, 10)
}

const wallTime = (minute: number): string =>
  `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}:00`

export const timedEvents = (
  count: number,
  days: number,
  from: string
): EventInput<BenchEvent>[] =>
  steps(count).map((value, index) => {
    const day = dayAfter(from, index % days)
    const minute = value % MINUTES_IN_DAY
    const minutes = MIN_DURATION + (value % DURATION_SPREAD)

    return {
      id: `event-${index}`,
      start: `${day}T${wallTime(minute)}`,
      duration: `PT${minutes}M`,
      data: { title: `Event ${index}` }
    }
  })

export const allDayEvents = (
  count: number,
  days: number,
  from: string
): EventInput<BenchEvent>[] =>
  steps(count).map((value, index) => ({
    id: `all-day-${index}`,
    start: dayAfter(from, index % days),
    end: dayAfter(from, (index % days) + 1 + (value % 3)),
    data: { title: `All day ${index}` }
  }))

export const recurringEvents = (
  count: number,
  rule: string,
  from: string
): EventInput<BenchEvent>[] =>
  steps(count).map((value, index) => ({
    id: `series-${index}`,
    start: `${from}T${wallTime(value % MINUTES_IN_DAY)}`,
    duration: 'PT30M',
    recurrence: { rule },
    data: { title: `Series ${index}` }
  }))
