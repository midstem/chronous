export type Scheme = 'light' | 'dark'

export type ColorScheme = {
  pinned: Scheme | null
  resolved: Scheme
  toggle: () => void
}
