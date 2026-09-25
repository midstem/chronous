import type { FrameworkOption } from './types'

export const FRAMEWORK_NAV_LABEL = 'Playgrounds'

export const PLAYGROUND_FRAMEWORKS: readonly FrameworkOption[] = [
  { id: 'react', title: 'React', packageName: '@midstem/chronous-react' },
  { id: 'angular', title: 'Angular', packageName: '@midstem/chronous-angular' }
]
