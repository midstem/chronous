import { expect, test } from './fixtures'

test.describe('registry calendar navigation', () => {
  test('steps between weeks and returns to today', async ({ calendar }) => {
    await calendar.goto()

    await calendar.button('Next period').click()
    await expect(calendar.caption).toHaveText('Mar 23 – Mar 29')
    await expect(calendar.today).toHaveCount(0)

    await calendar.button('Previous period').click()
    await calendar.button('Previous period').click()
    await expect(calendar.caption).toHaveText('Mar 9 – Mar 15')

    await calendar.button('Today').click()
    await expect(calendar.caption).toHaveText('Mar 16 – Mar 22')
    await expect(calendar.today).toHaveText('18')
  })

  test('steps a month at a time in month view', async ({ calendar }) => {
    await calendar.goto({ view: 'month' })

    await calendar.button('Next period').click()
    await expect(calendar.heading).toHaveText('April 2026')

    await calendar.button('Previous period').click()
    await calendar.button('Previous period').click()
    await expect(calendar.heading).toHaveText('February 2026')
  })

  test('keeps the date when the view changes', async ({ calendar }) => {
    await calendar.goto()

    await calendar.button('Next period').click()
    await calendar.selectView('Day')
    await expect(calendar.caption).toHaveText('Mar 25')
  })
})
