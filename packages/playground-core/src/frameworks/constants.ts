import type {
  FrameworkLogoData,
  FrameworkOption,
  PlaygroundFramework
} from './types'

export const FRAMEWORK_NAV_LABEL = 'Playgrounds'

export const PLAYGROUND_FRAMEWORKS: readonly FrameworkOption[] = [
  { id: 'react', title: 'React', packageName: '@midstem/chronous-react' },
  { id: 'angular', title: 'Angular', packageName: '@midstem/chronous-angular' },
  { id: 'vue', title: 'Vue', packageName: '@midstem/chronous-vue' }
]

export const FRAMEWORK_LOGOS: Record<PlaygroundFramework, FrameworkLogoData> = {
  react: {
    viewBox: '0 0 118 103',
    svg: '<g fill="none" fill-rule="evenodd"><circle cx="59" cy="51.5" r="10.8" fill="#61DAFB"/><ellipse cx="59" cy="51.5" rx="59" ry="22.9" stroke="#61DAFB" stroke-width="4.5"/><ellipse cx="59" cy="51.5" rx="59" ry="22.9" stroke="#61DAFB" stroke-width="4.5" transform="rotate(60 59 51.5)"/><ellipse cx="59" cy="51.5" rx="59" ry="22.9" stroke="#61DAFB" stroke-width="4.5" transform="rotate(120 59 51.5)"/></g>'
  },
  vue: {
    viewBox: '0 0 128 128',
    svg: '<path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"/><path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"/>'
  },
  angular: {
    viewBox: '0 0 250 250',
    svg: '<path fill="#dd0031" d="M125 30L31.9 63.2l14.2 123.1L125 230l78.9-43.7 14.2-123.1z"/><path fill="#c3002f" d="M125 30v22.2-.1V230l78.9-43.7 14.2-123.1z"/><path fill="#fff" d="M125 52.1L66.8 182.6h21.7l11.7-29.2h49.4l11.7 29.2H183zm17 83.3h-34l17-40.9z"/>'
  }
}
