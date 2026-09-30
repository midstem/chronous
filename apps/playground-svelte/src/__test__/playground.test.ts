import { fireEvent, render, screen } from '@testing-library/svelte'
import { compile } from 'svelte/compiler'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/svelte'
import type { CalendarRange, EventInput } from '@midstem/chronous-svelte'
import {
  DEFAULT_PRESET,
  INITIAL_STATE,
  rangeOf
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'
import App from '../App.svelte'
import { snippetOf } from '../snippet'

afterEach(() => cleanup())

describe('Svelte playground', () => {
  it('updates the board when view and range controls change', async () => {
    render(App)
    const view = screen.getByLabelText('view')
    await fireEvent.change(view, { target: { value: 'month' } })
    expect(
      screen.getByRole('button', { name: 'month', pressed: true })
    ).toBeTruthy()
    await fireEvent.change(screen.getByLabelText('currentDate'), {
      target: { value: '2026-04-02' }
    })
    expect(screen.getByText('April 2026')).toBeTruthy()
  })

  it('keeps the last valid events after invalid JSON and recovers on correction', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Events' }))
    const json = screen.getByLabelText('Events JSON')
    expect(screen.getByText(/on the board/)).toBeTruthy()
    await fireEvent.input(json, { target: { value: '{' } })
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText(/on the board/)).toBeTruthy()
    await fireEvent.input(json, { target: { value: '[]' } })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText(/0 on the board/)).toBeTruthy()
  })

  it('updates generated source, switches modes, navigates, and resets', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Code' }))
    expect(
      screen.getAllByText(/@midstem\/chronous-svelte/).length
    ).toBeGreaterThan(0)
    await fireEvent.change(screen.getByLabelText('view'), {
      target: { value: 'month' }
    })
    expect(document.querySelector('pre')?.textContent).toContain(
      'view: "month"'
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Next period' }))
    expect(screen.getByText('April 2026')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(
      screen.getByRole('button', { name: 'week', pressed: true })
    ).toBeTruthy()
  })

  it('compiles safe standalone Svelte snippets for each view and style', () => {
    for (const view of ['day', 'week', 'days', 'month', 'agenda'] as const) {
      const range: CalendarRange = { ...rangeOf(INITIAL_STATE), view }
      for (const style of ['default', 'simple'] as const) {
        const suspiciousEvents: EventInput<EventData>[] = [
          {
            id: 'close-script',
            start: '2026-03-18T09:00:00',
            duration: 'PT30M',
            data: { title: '</script> "\n&' }
          }
        ]
        const source = snippetOf(
          range,
          suspiciousEvents,
          '</script>"\n',
          60,
          style
        )
        const script =
          source.match(/<script lang="ts">([\s\S]*?)<\/script>/)?.[1] ?? ''
        expect(script).not.toContain('</script>')
        expect(() =>
          compile(source, { filename: 'Calendar.svelte', generate: 'client' })
        ).not.toThrow()
      }
    }
    expect(DEFAULT_PRESET.events.length).toBeGreaterThan(0)
  })
})
