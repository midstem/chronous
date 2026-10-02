import { expect, test } from './fixtures'

test.describe('events sidebar tab', () => {
  test('displays json editor and updates calendar when events change', async ({
    playground
  }) => {
    await playground.goto()
    await playground.switchSidebarTab('Events')

    await expect(playground.editor).toBeVisible()

    const initialSource = await playground.editor.inputValue()
    expect(initialSource).toContain('Standup')

    const customEvents = [
      {
        id: 'e2e-custom-test-event',
        start: '2026-03-24T10:00:00',
        end: '2026-03-24T11:00:00',
        data: { title: 'E2E Playwright Event' }
      }
    ]

    await playground.setEvents(customEvents)

    await expect(
      playground.eventsByTitle('E2E Playwright Event').first()
    ).toBeVisible()
  })

  test('validates json input showing alert and preserving calendar on error', async ({
    playground
  }) => {
    await playground.goto()
    await playground.switchSidebarTab('Events')

    await expect(playground.editor).toBeVisible()
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    await playground.editEventsJson('{ invalid json')
    await expect(playground.alerts).toBeVisible()
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    await playground.editEventsJson('{"id": "not-an-array"}')
    await expect(playground.alerts).toContainText(
      'The events must be a JSON array'
    )
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    await playground.editEventsJson('[{"start": "2026-03-24T10:00:00"}]')
    await expect(playground.alerts).toContainText('has no string "id"')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    await playground.editEventsJson('[{"id": "evt-no-start"}]')
    await expect(playground.alerts).toContainText('has no string "start"')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    const validReplacement = [
      {
        id: 'valid-replacement',
        start: '2026-03-25T10:00:00',
        end: '2026-03-25T11:00:00',
        data: { title: 'Valid Replacement Event' }
      }
    ]
    await playground.setEvents(validReplacement)

    await expect(playground.alerts).toHaveCount(0)
    await expect(
      playground.eventsByTitle('Valid Replacement Event').first()
    ).toBeVisible()
    await expect(playground.eventsByTitle('Standup')).toHaveCount(0)
  })

  test('replaces calendar dom nodes when events are modified or cleared', async ({
    playground
  }) => {
    await playground.goto()
    await playground.switchSidebarTab('Events')

    const initialEvents = [
      {
        id: 'replaceable-event',
        start: '2026-03-25T10:00:00',
        end: '2026-03-25T11:00:00',
        data: { title: 'Alpha Event' }
      }
    ]
    await playground.setEvents(initialEvents)
    await expect(playground.eventsByTitle('Alpha Event').first()).toBeVisible()

    const updatedEvents = [
      {
        id: 'replaceable-event',
        start: '2026-03-25T10:00:00',
        end: '2026-03-25T11:00:00',
        data: { title: 'Beta Event' }
      }
    ]
    await playground.setEvents(updatedEvents)
    await expect(playground.eventsByTitle('Beta Event').first()).toBeVisible()
    await expect(playground.eventsByTitle('Alpha Event')).toHaveCount(0)

    await playground.editEventsJson('[]')
    await expect(playground.eventsByTitle('Beta Event')).toHaveCount(0)
  })

  test('renders duration-only and default-duration events with expected times', async ({
    playground
  }) => {
    await playground.goto()
    await playground.switchSidebarTab('Events')

    const sampleEvents = [
      {
        id: 'duration-only-event',
        start: '2026-03-25T14:00:00',
        duration: 'PT45M',
        data: { title: 'Duration Only 45M' }
      },
      {
        id: 'default-duration-allday',
        start: '2026-03-25',
        data: { title: 'Default Duration AllDay' }
      }
    ]
    await playground.setEvents(sampleEvents)

    await expect(
      playground.eventsByTitle('Duration Only 45M').first()
    ).toBeVisible()
    await expect(playground.eventTitle('duration-only-event')).toHaveAttribute(
      'title',
      /14:00 – 14:45/
    )

    await expect(
      playground.eventsByTitle('Default Duration AllDay').first()
    ).toBeVisible()
    await expect(
      playground.allDayEvent('default-duration-allday')
    ).toBeVisible()
  })

  test('observes no page errors during standard interactions', async ({
    playground,
    page
  }) => {
    const errors: Error[] = []
    page.on('pageerror', (err) => errors.push(err))

    await playground.goto()
    await playground.switchSidebarTab('Events')

    const customEvents = [
      {
        id: 'healthy-check',
        start: '2026-03-25T10:00:00',
        end: '2026-03-25T11:00:00',
        data: { title: 'Healthy Event' }
      }
    ]
    await playground.setEvents(customEvents)
    await expect(
      playground.eventsByTitle('Healthy Event').first()
    ).toBeVisible()

    await playground.switchSidebarTab('Options')
    expect(errors.length).toBe(0)
  })
})
