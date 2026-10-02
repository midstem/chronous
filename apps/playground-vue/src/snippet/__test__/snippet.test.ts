import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

import type { CalendarRange, EventInput } from '@midstem/chronous-vue'
import type { EventData } from '@midstem/playground-core'
import { snippetOf } from '../helpers'

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
const generatedOf = (view: CalendarRange['view']): string =>
  snippetOf({ ...range, view }, events, locale, 60)

describe('Vue copyable snippet', () => {
  it('emits only the selected renderer with its required helpers', () => {
    for (const view of ['day', 'week', 'days', 'month', 'agenda'] as const) {
      const generated = generatedOf(view)
      if (['day', 'week', 'days'].includes(view)) {
        expect(generated).toContain('<Calendar.TimeGrid')
        expect(generated).not.toContain('<Calendar.MonthGrid')
        expect(generated).not.toContain('<Calendar.AgendaList')
        expect(generated).toContain('const HOUR_HEIGHT = 60')
        expect(generated).toContain('const clock =')
      } else if (view === 'month') {
        expect(generated).toContain('<Calendar.MonthGrid')
        expect(generated).not.toContain('<Calendar.TimeGrid')
        expect(generated).not.toContain('<Calendar.AgendaList')
        expect(generated).toContain('const MONTH_LANE_HEIGHT =')
        expect(generated).not.toContain('const HOUR_HEIGHT')
        expect(generated).not.toContain('const clock =')
      } else {
        expect(generated).toContain('<Calendar.AgendaList')
        expect(generated).not.toContain('<Calendar.TimeGrid')
        expect(generated).not.toContain('<Calendar.MonthGrid')
        expect(generated).not.toContain('const HOUR_HEIGHT')
        expect(generated).not.toContain('const clock =')
      }
      expect(generated).not.toContain('VIEWS')
      expect(generated).not.toContain('withView')
      expect(generated).toContain('navigation.prev && goTo(navigation.prev)')
      expect(generated).toContain('@navigate="range = $event"')
      expect(generated).toContain('event.data?.title ?? event.id')
      expect(generated).toContain(`const LOCALE = ${JSON.stringify(locale)}`)
      expect(generated).toContain(
        JSON.stringify(events[0].data?.title).replace(/</g, '\\u003c')
      )
      if (['day', 'week', 'days'].includes(view)) {
        expect(generated.indexOf('const ALL_DAY_LANE_HEIGHT')).toBeLessThan(
          generated.indexOf('</script>')
        )
      }
      expect(generated).not.toContain('createCalendarComponents')
    }
  })

  it('compiles every generated SFC script and template', () => {
    for (const view of ['day', 'week', 'days', 'month', 'agenda'] as const) {
      const generated = generatedOf(view)
      const { descriptor, errors } = parse(generated, {
        filename: 'Calendar.vue'
      })
      expect(errors, view).toEqual([])
      expect(descriptor.scriptSetup, view).not.toBeNull()

      const script = compileScript(descriptor, { id: `generated-${view}` })
      const template = compileTemplate({
        source: descriptor.template?.content ?? '',
        filename: 'Calendar.vue',
        id: `generated-${view}`,
        compilerOptions: { bindingMetadata: script.bindings }
      })
      expect(template.errors, view).toEqual([])
    }
  })
})
