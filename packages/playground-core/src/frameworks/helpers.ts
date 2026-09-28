import { FRAMEWORK_LOGOS, PLAYGROUND_FRAMEWORKS } from './constants'
import type {
  FrameworkLink,
  FrameworkLogoData,
  PlaygroundFramework
} from './types'

export const getFrameworkLinks = (
  current: PlaygroundFramework
): FrameworkLink[] =>
  PLAYGROUND_FRAMEWORKS.map((framework) => ({
    ...framework,
    href: `../${framework.id}/`,
    isCurrent: framework.id === current
  }))

export const getFrameworkLogo = (
  framework: PlaygroundFramework
): FrameworkLogoData => FRAMEWORK_LOGOS[framework]
