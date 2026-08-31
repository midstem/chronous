export type RuntimeState = 'native' | 'polyfill' | 'missing'

export type RuntimeCopy = {
  badge: string
  summary: string
  detail: string
}

export type SupportRow = {
  browser: string
  since: string
  when: string
}
