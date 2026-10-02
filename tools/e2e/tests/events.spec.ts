import { expect, test } from '@playwright/test'
import { openPlayground, settle, switchSidebarTab } from './helpers'

test.describe('events sidebar tab', () => {
  test('displays events JSON editor and updates calendar when JSON changes', async ({
    page
  }) => {
    await openPlayground(page)

    // Switch to Events tab
    await switchSidebarTab(page, 'Events')
    await settle(page)

    const textarea = page.getByRole('textbox', { name: 'Events JSON' })
    await expect(textarea).toBeVisible()

    const initialSource = await textarea.inputValue()
    expect(initialSource).toContain('Standup')

    // Add a custom event
    const customEvents = [
      {
        id: 'e2e-custom-test-event',
        start: '2026-03-24T10:00:00',
        end: '2026-03-24T11:00:00',
        data: { title: 'E2E Playwright Event' }
      }
    ]

    await textarea.fill(JSON.stringify(customEvents, null, 2))
    await textarea.dispatchEvent('input')
    await settle(page)

    // Verify custom event appears on the calendar
    await expect(page.getByText('E2E Playwright Event').first()).toBeVisible()
  })
})
