import { expect, test } from './fixtures'

test.describe('initial render', () => {
  test('loads playground with masthead and navigation', async ({
    playground
  }) => {
    await playground.goto()

    await expect(playground.heading).toBeVisible()
    await expect(playground.mastheadTag).toBeVisible()
    await expect(playground.calendarModeButton).toBeVisible()
    await expect(playground.codeModeButton).toBeVisible()
    await expect(playground.resetButton).toBeVisible()

    await expect(playground.title).toBeVisible()
    const titleText = (await playground.title.innerText()).trim()
    expect(titleText.length).toBeGreaterThan(0)
    expect(titleText).toContain('March 2026')
  })

  test('starts in week view with showcase events', async ({ playground }) => {
    await playground.goto()

    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()
    await expect(
      playground.eventsByTitle('Sprint window').first()
    ).toBeVisible()
  })

  test('renders engine state details with scalar data', async ({
    playground
  }) => {
    await playground.goto()

    await expect(playground.inspector).toBeVisible()
    await expect(playground.metric('view')).toHaveText('week')
    await expect(playground.metric('days')).toHaveText('7')

    await playground.selectView('day')
    await expect(playground.metric('view')).toHaveText('day')
    await expect(playground.metric('days')).toHaveText('1')

    await playground.openInspector()
    await expect(playground.inspectorJson).toBeVisible()

    const jsonText = await playground.inspectorJson.innerText()
    expect(jsonText).not.toContain('truncated')
    const parsedState = JSON.parse(jsonText) as Record<string, unknown>
    expect(parsedState.view).toBe('day')
    expect(Array.isArray(parsedState.days)).toBe(true)
    expect((parsedState.days as unknown[]).length).toBe(1)
  })
})
