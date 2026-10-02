export interface PlaygroundConfig {
  id: string
  name: string
  port: number
  path: string
  packageName: string
}

export const PLAYGROUNDS: readonly PlaygroundConfig[] = [
  {
    id: 'react',
    name: 'React',
    port: 3100,
    path: '../../apps/playground-react',
    packageName: '@midstem/chronous-react'
  },
  {
    id: 'angular',
    name: 'Angular',
    port: 3101,
    path: '../../apps/playground-angular',
    packageName: '@midstem/chronous-angular'
  },
  {
    id: 'vue',
    name: 'Vue',
    port: 3102,
    path: '../../apps/playground-vue',
    packageName: '@midstem/chronous-vue'
  },
  {
    id: 'svelte',
    name: 'Svelte',
    port: 3103,
    path: '../../apps/playground-svelte',
    packageName: '@midstem/chronous-svelte'
  },
  {
    id: 'vanilla',
    name: 'Vanilla JS',
    port: 3104,
    path: '../../apps/playground-vanilla',
    packageName: '@midstem/chronous'
  }
]
