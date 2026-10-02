import { test as base, expect } from '@playwright/test'
import { PlaygroundPage } from '../pages/playground'

export const test = base.extend<{ playground: PlaygroundPage }>({
  playground: async ({ page }, provide): Promise<void> => {
    await provide(new PlaygroundPage(page))
  }
})

export { expect }
