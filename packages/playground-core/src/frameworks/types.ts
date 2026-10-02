export type PlaygroundFramework =
  'react' | 'angular' | 'vue' | 'svelte' | 'vanilla'

export type FrameworkLogoData = {
  viewBox: string
  svg: string
}

export type FrameworkOption = {
  id: PlaygroundFramework
  title: string
  packageName: string
}

export type FrameworkLink = FrameworkOption & {
  href: string
  isCurrent: boolean
}
