import { parseTemplate } from '@angular/compiler'
import { NgtscProgram, readConfiguration } from '@angular/compiler-cli'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import type { CalendarRange, EventInput } from '@midstem/chronous-angular'
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

const templateOf = (source: string): string => {
  const opening = 'template: `'
  const start = source.indexOf(opening)
  const end = source.indexOf('\n  `', start)
  if (start < 0 || end < 0)
    throw new Error('Generated Angular template was not found')
  return source.slice(start + opening.length, end)
}

describe('Angular copyable snippet', () => {
  it('keeps all view renderers reactive and serializes user strings safely', () => {
    expect(generated).toContain('range().view === "month"')
    expect(generated).toContain('range().view === "agenda"')
    expect(generated).toContain('chronousAgendaList')
    expect(generated).toContain('event.data?.title ?? event.id')
    expect(generated).toContain(
      `const LOCALE: string = ${JSON.stringify(locale)}`
    )
    expect(generated).toContain(JSON.stringify(events[0].data?.title))
    expect(generated).toContain('readonly LOCALE = LOCALE')
    for (const name of [
      'ALL_DAY_LANE_HEIGHT',
      'MONTH_LANE_HEIGHT',
      'MONTH_MAX_LANES',
      'MIN_BOX_HEIGHT',
      'BOX_GAP',
      'SCROLL_TO_HOUR',
      'NUMBER_HEIGHT',
      'BAR_GAP'
    ]) {
      expect(generated).toContain(`readonly ${name} = ${name}`)
    }
  })

  it('parses the generated template with Angular control flow and bindings', () => {
    const parsed = parseTemplate(templateOf(generated), 'BoardComponent.html')
    expect(parsed.errors).toBeNull()
  })

  it('passes Angular template semantic checking with the generated component class', async () => {
    const projectRoot = new URL('../../..', import.meta.url).pathname
    const config = readConfiguration(`${projectRoot}/tsconfig.json`)
    expect(config.errors).toEqual([])
    const options = { ...config.options, noEmit: true } as ts.CompilerOptions
    const virtualPath = `${projectRoot}/src/snippet/__test__/generated-board.ts`
    const isVirtualFile = (fileName: string): boolean =>
      fileName.replaceAll('\\', '/').endsWith('/generated-board.ts')
    const host = ts.createCompilerHost(options)
    const originalFileExists = host.fileExists.bind(host)
    const originalReadFile = host.readFile.bind(host)
    const originalGetSourceFile = host.getSourceFile.bind(host)
    host.fileExists = (fileName) =>
      isVirtualFile(fileName) || originalFileExists(fileName)
    host.readFile = (fileName) =>
      isVirtualFile(fileName) ? generated : originalReadFile(fileName)
    host.getSourceFile = (
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile
    ) =>
      isVirtualFile(fileName)
        ? ts.createSourceFile(fileName, generated, languageVersion, true)
        : originalGetSourceFile(
            fileName,
            languageVersion,
            onError,
            shouldCreateNewSourceFile
          )

    const program = new NgtscProgram(
      [...config.rootNames, virtualPath],
      options,
      host
    )
    await program.loadNgStructureAsync()
    const diagnostics = [
      ...program.getTsOptionDiagnostics(),
      ...program.getTsSemanticDiagnostics(),
      ...program.getNgOptionDiagnostics(),
      ...program.getNgStructuralDiagnostics(),
      ...program.getNgSemanticDiagnostics(virtualPath)
    ]
    expect(
      diagnostics.map((item) => {
        const location = item.file?.getLineAndCharacterOfPosition(
          item.start ?? 0
        )
        const line = item.file?.text.split('\n')[location?.line ?? 0]
        return `${item.file?.fileName ?? ''}:${location?.line ?? ''}: ${line ?? ''} — ${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`
      })
    ).toEqual([])
  })
})
