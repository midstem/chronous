import { compile } from 'svelte/compiler'
import { describe, expect, it } from 'vitest'

import type { CalendarRange, EventInput } from '@midstem/chronous-svelte'
import type { EventData, Style } from '@midstem/playground-core'
import { snippetOf } from '../snippet'

const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-10-02',
  timeZone: 'Europe/Kyiv'
}

const events = [
  {
    id: 'event-1',
    start: '2026-10-02T09:00:00+03:00',
    end: '2026-10-02T10:00:00+03:00',
    data: { title: 'Say "hi": </script><script>alert(1)</script>' }
  }
] as EventInput<EventData>[]

const locale = "en-GB' ; throw new Error('bad')"
const generated = snippetOf(range, events, locale, 60)

describe('Svelte copyable snippet', () => {
  it('keeps all view renderers reactive and serializes user strings safely', () => {
    expect(generated).toContain("{:else if range.view === 'month'}")
    expect(generated).toContain('<C.AgendaList')
    expect(generated).toContain('event.data?.title ?? event.id')
    expect(generated).toContain(`const locale = ${JSON.stringify(locale)}`)
    expect(generated).toContain(
      JSON.stringify(events[0].data?.title).replace(/</g, '\\u003c')
    )
  })

  it('compiles as a standalone Svelte component', () => {
    const result = compile(generated, {
      filename: 'Calendar.svelte',
      generate: 'client'
    })
    expect(
      result.warnings.map(({ code, message }) => `${code}: ${message}`)
    ).toEqual([])
  })

  it('compiles every view in both full and simple styles', () => {
    for (const view of ['day', 'week', 'days', 'month', 'agenda'] as const) {
      for (const style of [
        'default',
        'simple'
      ] as const satisfies readonly Style[]) {
        const source = snippetOf({ ...range, view }, events, locale, 60, style)
        const result = compile(source, {
          filename: `Calendar-${view}-${style}.svelte`,
          generate: 'client'
        })
        expect(result.warnings).toEqual([])
      }
    }
  })
})
