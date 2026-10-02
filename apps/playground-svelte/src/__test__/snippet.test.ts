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
  it('generates only the selected renderer and serializes user strings safely', () => {
    expect(generated).toContain('<C.TimeGrid')
    expect(generated).not.toContain('<C.MonthGrid')
    expect(generated).not.toContain('<C.AgendaList')
    expect(generated).not.toContain('range.view')
    expect(generated).not.toContain('ViewKind')
    expect(generated).not.toContain('const views')
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

  it('compiles only the selected renderer for every view and style', () => {
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
        expect(source).not.toContain('range.view')
        expect(source).not.toContain('ViewKind')
        expect(source).not.toContain('const views')
        expect(source).not.toContain('@midstem/playground-core')
        if (view === 'month') {
          expect(source).toContain('<C.MonthGrid')
          expect(source).not.toContain('<C.TimeGrid')
          expect(source).not.toContain('<C.AgendaList')
          expect(source).not.toContain('formatIso')
        } else if (view === 'agenda') {
          expect(source).toContain('<C.AgendaList')
          expect(source).not.toContain('<C.TimeGrid')
          expect(source).not.toContain('<C.MonthGrid')
          expect(source).not.toContain('formatIso')
        } else {
          expect(source).toContain('<C.TimeGrid')
          expect(source).not.toContain('<C.MonthGrid')
          expect(source).not.toContain('<C.AgendaList')
          expect(source).toContain('formatIso')
        }
        if (style === 'default') {
          expect(source).toContain('<C.Toolbar')
          expect(source).toContain('navigation.prev')
          expect(source).toContain('navigation.today')
          expect(source).toContain('navigation.next')
        } else {
          expect(source).not.toContain('<C.Toolbar')
        }
        expect(source).not.toContain('navigation.withView')
      }
    }
  })
})
