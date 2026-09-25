import { describe, expect, it } from 'vitest'

import {
  FRAMEWORK_NAV_LABEL,
  PLAYGROUND_FRAMEWORKS,
  getFrameworkLinks
} from '../index'

describe('frameworks', () => {
  it('defines the playgrounds nav label', () => {
    expect(FRAMEWORK_NAV_LABEL).toBe('Playgrounds')
  })

  it('contains react, angular, and vue framework entries', () => {
    const ids = PLAYGROUND_FRAMEWORKS.map((f) => f.id)
    expect(ids).toEqual(['react', 'angular', 'vue'])
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
      }
    ])

    const angularLinks = getFrameworkLinks('angular')
    expect(angularLinks[0].isCurrent).toBe(false)
    expect(angularLinks[1].isCurrent).toBe(true)
    expect(angularLinks[2].isCurrent).toBe(false)

    const vueLinks = getFrameworkLinks('vue')
    expect(vueLinks[0].isCurrent).toBe(false)
    expect(vueLinks[1].isCurrent).toBe(false)
    expect(vueLinks[2].isCurrent).toBe(true)
  })
})
