import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import type { CalendarRange, EventInput } from '@midstem/chronous-react'
import type { EventData } from '../../types'
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

describe('React copyable snippet', () => {
  it('keeps all view renderers reactive and serializes user strings safely', () => {
    expect(generated).toContain('SLOTTED_VIEWS.includes(range.view)')
    expect(generated).toContain('range.view === "month"')
    expect(generated).toContain('<Calendar.AgendaList')
    expect(generated).toContain('event.data?.title ?? event.id')
    expect(generated).toContain(`const LOCALE = ${JSON.stringify(locale)}`)
    expect(generated).toContain(JSON.stringify(events[0].data?.title))
  })

  it('passes TypeScript semantic checking as a standalone TSX file', () => {
    const projectRoot = new URL('../../..', import.meta.url).pathname
    const configPath = `${projectRoot}/tsconfig.json`
    const config = ts.readConfigFile(configPath, (path) =>
      ts.sys.readFile(path)
    )
    expect(config.error).toBeUndefined()
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      projectRoot
    )
    const virtualPath = `${projectRoot}/src/snippet/__test__/generated-calendar.tsx`
    const isVirtualFile = (fileName: string): boolean =>
      fileName.replaceAll('\\', '/').endsWith('/generated-calendar.tsx')
    const host = ts.createCompilerHost(parsed.options)
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
        ? ts.createSourceFile(
            fileName,
            generated,
            languageVersion,
            true,
            ts.ScriptKind.TSX
          )
        : originalGetSourceFile(
            fileName,
            languageVersion,
            onError,
            shouldCreateNewSourceFile
          )

    const program = ts.createProgram([virtualPath], parsed.options, host)
    const diagnostics = ts.getPreEmitDiagnostics(program)
    expect(
      diagnostics.map((item) =>
        ts.flattenDiagnosticMessageText(item.messageText, '\n')
      )
    ).toEqual([])
  })
})
