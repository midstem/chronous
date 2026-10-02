import { describe, expect, it } from 'vitest'

import {
  FRAMEWORK_LOGOS,
  FRAMEWORK_NAV_LABEL,
  PLAYGROUND_FRAMEWORKS,
  getFrameworkLinks,
  getFrameworkLogo
} from '../index'

describe('frameworks', () => {
  it('defines the playgrounds nav label', () => {
    expect(FRAMEWORK_NAV_LABEL).toBe('Playgrounds')
  })

  it('contains all framework entries', () => {
    const ids = PLAYGROUND_FRAMEWORKS.map((f) => f.id)
    expect(ids).toEqual(['react', 'angular', 'vue', 'svelte', 'vanilla'])
  })

  it('provides logos for each framework', () => {
    for (const framework of [
      'react',
      'angular',
      'vue',
      'svelte',
      'vanilla'
    ] as const) {
      const logo = getFrameworkLogo(framework)
      expect(logo).toBe(FRAMEWORK_LOGOS[framework])
      expect(logo.viewBox).toBeTruthy()
      expect(logo.svg).toBeTruthy()
    }
  })

  it('returns links relative to current framework', () => {
    const reactLinks = getFrameworkLinks('react')
    expect(reactLinks).toEqual([
      {
        id: 'react',
        title: 'React',
        packageName: '@midstem/chronous-react',
        href: '../react/',
        isCurrent: true
      },
      {
        id: 'angular',
        title: 'Angular',
        packageName: '@midstem/chronous-angular',
        href: '../angular/',
        isCurrent: false
      },
      {
        id: 'vue',
        title: 'Vue',
        packageName: '@midstem/chronous-vue',
        href: '../vue/',
        isCurrent: false
      },
      {
        id: 'svelte',
        title: 'Svelte',
        packageName: '@midstem/chronous-svelte',
        href: '../svelte/',
        isCurrent: false
      },
      {
        id: 'vanilla',
        title: 'Vanilla JS',
        packageName: '@midstem/chronous',
        href: '../vanilla/',
        isCurrent: false
      }
    ])

    const angularLinks = getFrameworkLinks('angular')
    expect(angularLinks[0].isCurrent).toBe(false)
    expect(angularLinks[1].isCurrent).toBe(true)
    expect(angularLinks[2].isCurrent).toBe(false)

    const svelteLinks = getFrameworkLinks('svelte')
    expect(
      svelteLinks.filter((link) => link.isCurrent).map((link) => link.id)
    ).toEqual(['svelte'])

    const vueLinks = getFrameworkLinks('vue')
    expect(vueLinks[0].isCurrent).toBe(false)
    expect(vueLinks[1].isCurrent).toBe(false)
    expect(vueLinks[2].isCurrent).toBe(true)

    const vanillaLinks = getFrameworkLinks('vanilla')
    expect(
      vanillaLinks.filter((link) => link.isCurrent).map((link) => link.id)
    ).toEqual(['vanilla'])
  })
})
