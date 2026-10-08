import { expect, test } from './fixtures'

test.describe('registry calendar recurring events', () => {
  test('repeats the weekday series in every week', async ({ calendar }) => {
    await calendar.goto()

    for (const caption of ['Mar 23 – Mar 29', 'Mar 30 – Apr 5']) {
      await calendar.button('Next period').click()
      await expect(calendar.caption).toHaveText(caption)
      await expect(calendar.event('Daily standup')).toHaveCount(5)
    }

    await calendar.button('Today').click()
    await calendar.button('Previous period').click()
    await expect(calendar.caption).toHaveText('Mar 9 – Mar 15')
    await expect(calendar.event('Daily standup')).toHaveCount(5)
  })

  test('alternates the every-other-week series', async ({ calendar }) => {
    await calendar.goto()
    await expect(calendar.event('Sprint planning')).toHaveCount(1)

    await calendar.button('Next period').click()
    await expect(calendar.event('Sprint planning')).toHaveCount(0)

    await calendar.button('Next period').click()
    await expect(calendar.event('Sprint planning')).toHaveCount(1)
  })

  test('places overlapping events side by side', async ({ calendar }) => {
    await calendar.goto()

    const review = await calendar.event('Design review').boundingBox()
    const oneOnOne = await calendar.event('1:1 with manager').boundingBox()
    expect(review).not.toBeNull()
    expect(oneOnOne).not.toBeNull()
    expect(oneOnOne!.x).toBeGreaterThanOrEqual(review!.x + review!.width - 1)
  })
})
