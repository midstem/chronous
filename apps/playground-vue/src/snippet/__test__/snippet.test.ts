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
const generated = snippetOf(range, events, locale, 60)

describe('Vue copyable snippet', () => {
  it('keeps all view renderers reactive and serializes user strings safely', () => {
    expect(generated).toContain(
      "v-if=\"['day', 'week', 'days'].includes(range.view)\""
    )
    expect(generated).toContain('v-else-if="range.view === \'month\'"')
    expect(generated).toContain('<Calendar.AgendaList')
    expect(generated).toContain('event.data?.title ?? event.id')
    expect(generated).toContain(`const LOCALE = ${JSON.stringify(locale)}`)
    expect(generated).toContain(
      JSON.stringify(events[0].data?.title).replace(/</g, '\\u003c')
    )
    expect(generated.indexOf('const ALL_DAY_LANE_HEIGHT')).toBeLessThan(
      generated.indexOf('</script>')
    )
    expect(generated).not.toContain('createCalendarComponents')
  })

  it('compiles the generated SFC script and template', () => {
    const { descriptor, errors } = parse(generated, {
      filename: 'Calendar.vue'
    })
    expect(errors).toEqual([])
    expect(descriptor.scriptSetup).not.toBeNull()

    const script = compileScript(descriptor, { id: 'generated-calendar' })
    const template = compileTemplate({
      source: descriptor.template?.content ?? '',
      filename: 'Calendar.vue',
      id: 'generated-calendar',
      compilerOptions: { bindingMetadata: script.bindings }
    })
    expect(template.errors).toEqual([])
  })
})
