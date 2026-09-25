export type PlaygroundFramework = 'react' | 'angular'

export type FrameworkOption = {
  id: PlaygroundFramework
  title: string
  packageName: string
}

export type FrameworkLink = FrameworkOption & {
  href: string
  isCurrent: boolean
}
