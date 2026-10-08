const DAYS_IN_WEEK = 7

const MONDAY_OFFSET = 6

export const shifted = (date: string, days: number): string => {
  const moment = new Date(`${date}T00:00:00Z`)
  moment.setUTCDate(moment.getUTCDate() + days)
  return moment.toISOString().slice(0, 10)
}

export const mondayOf = (date: string): string => {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return shifted(date, -((weekday + MONDAY_OFFSET) % DAYS_IN_WEEK))
}
