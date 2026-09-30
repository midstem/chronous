import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'
import type { CalendarRange, EventInput } from '../src/engine.js'
import CalendarFixture from './fixtures/CalendarFixture.svelte'

type Data = { title: string }
const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const events: EventInput<Data>[] = [
  {
    id: 'server-event',
    start: '2026-03-18T09:00:00',
    end: '2026-03-18T10:00:00',
    data: { title: 'Server render' }
  }
]

describe('server rendering', () => {
  it('renders calendar components without window access or timers', () => {
    expect(typeof window).toBe('undefined')
    const { body } = render(CalendarFixture, { props: { range, events } })
    expect(body).toContain('data-event-id="server-event"')
    expect(body).toContain('2026-03-18')
  })
})
