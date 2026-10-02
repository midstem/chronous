import { expect, test } from './fixtures'

test.describe('stage modes and reset', () => {
  test('switches between calendar and code modes', async ({ playground }) => {
    await playground.goto()

    await expect(playground.title).toBeVisible()

    await playground.switchMode('Code')

    await expect(playground.codeSnippet.first()).toBeVisible()
    const codeText = await playground.codeSnippet.first().innerText()
    expect(codeText).toContain('@midstem/chronous')

    await playground.switchMode('Calendar')
    await expect(playground.title).toBeVisible()
  })

  test('restores defaults and clears json error when clicking reset', async ({
    playground
  }) => {
    await playground.goto()

    await playground.selectView('month')
    await playground.setCurrentDate('2026-11-15')
    await playground.selectPreset('overlaps')
    await playground.selectTimeZone('UTC')
    await playground.selectDensity('compact')
    await playground.selectStyle('simple')

    await playground.editEventsJson('{ unparseable json')
    await expect(playground.alerts).toBeVisible()

    await playground.reset()

    await expect(playground.alerts).toHaveCount(0)

    await playground.switchSidebarTab('Options')
    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.currentDateInput).toHaveValue('2026-03-25')
    await expect(playground.presetSelect).toHaveValue('showcase')
    await expect(playground.timeZoneSelect).toHaveValue('Europe/Kyiv')
    await expect(playground.densityButton('cosy')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(playground.styleSelect).toHaveValue('default')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()
  })
})
