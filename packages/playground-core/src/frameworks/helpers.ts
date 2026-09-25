import { PLAYGROUND_FRAMEWORKS } from './constants'
import type { FrameworkLink, PlaygroundFramework } from './types'

export const getFrameworkLinks = (
  current: PlaygroundFramework
): FrameworkLink[] =>
  PLAYGROUND_FRAMEWORKS.map((framework) => ({
    ...framework,
    href: `../${framework.id}/`,
    isCurrent: framework.id === current
  }))
