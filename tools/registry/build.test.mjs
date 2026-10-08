import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, it } from 'node:test'
import { buildRegistry } from './build.mjs'

const temporaryDirectories = []

async function temporaryDirectory() {
  const path = await mkdtemp(join(tmpdir(), 'chronous-registry-'))
  temporaryDirectories.push(path)
  return path
}

after(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true }))
  )
})

describe('shadcn registry build', () => {
  it('emits an editable calendar source with dependencies and a catalog', async () => {
    const root = new URL('../..', import.meta.url).pathname
    const output = await temporaryDirectory()

    await buildRegistry({ root, output })
    const item = JSON.parse(
      await readFile(join(output, 'chronous-calendar.json'), 'utf8')
    )
    const catalog = JSON.parse(
      await readFile(join(output, 'registry.json'), 'utf8')
    )
    const sourceRegistry = JSON.parse(
      await readFile(join(root, 'registry.json'), 'utf8')
    )
    const expectedFiles = await Promise.all(
      sourceRegistry.items[0].files.map(async (file) => ({
        ...file,
        content: await readFile(join(root, file.path), 'utf8')
      }))
    )

    assert.equal(catalog.items[0].name, 'chronous-calendar')
    assert.deepEqual(item.dependencies, [
      '@midstem/chronous-react@^1.0.2',
      'temporal-polyfill@^1.0.4'
    ])
    assert.deepEqual(item.registryDependencies, ['button'])
    assert.equal(
      item.$schema,
      'https://ui.shadcn.com/schema/registry-item.json'
    )
    assert.deepEqual(item.files, expectedFiles)
    assert.deepEqual(
      item.files.map((file) => file.target),
      [
        '@ui/chronous-calendar.tsx',
        '@ui/chronous-calendar/calendar.ts',
        '@ui/chronous-calendar/events.tsx',
        '@ui/chronous-calendar/toolbar.tsx',
        '@ui/chronous-calendar/views.tsx'
      ]
    )
    assert.match(item.files[0].content, /export function ChronousCalendar/)
    assert.match(item.files[3].content, /from '@\/components\/ui\/button'/)
  })

  it('fails when the catalog does not declare registry items', async () => {
    const root = await temporaryDirectory()
    await writeFile(
      join(root, 'registry.json'),
      JSON.stringify({ name: 'empty' })
    )

    await assert.rejects(
      buildRegistry({ root, output: 'out' }),
      /must include an items array/
    )
  })

  it('fails when a declared calendar support module is missing', async () => {
    const root = await temporaryDirectory()
    const mainPath = 'registry/default/chronous-calendar/chronous-calendar.tsx'
    const supportPath =
      'registry/default/chronous-calendar/chronous-calendar/calendar.ts'
    await mkdir(join(root, 'registry/default/chronous-calendar'), {
      recursive: true
    })
    await writeFile(
      join(root, 'registry.json'),
      JSON.stringify({
        items: [
          {
            name: 'chronous-calendar',
            files: [
              { path: mainPath, target: '@ui/chronous-calendar.tsx' },
              {
                path: supportPath,
                target: '@ui/chronous-calendar/calendar.ts'
              }
            ]
          }
        ]
      })
    )
    await writeFile(join(root, mainPath), 'export const calendar = true')

    await assert.rejects(
      buildRegistry({ root, output: 'out' }),
      /chronous-calendar\/calendar\.ts/
    )
  })

  it('supports a caller-selected output directory', async () => {
    const root = await temporaryDirectory()
    const output = join(root, 'custom-output')
    await writeFile(
      join(root, 'registry.json'),
      JSON.stringify({
        items: [{ name: 'sample', files: [{ path: 'sample.tsx' }] }]
      })
    )
    await writeFile(join(root, 'sample.tsx'), 'export const sample = true')

    await buildRegistry({ root, output })
    assert.equal(
      JSON.parse(await readFile(join(output, 'sample.json'), 'utf8')).files[0]
        .content,
      'export const sample = true'
    )
    assert.equal(
      JSON.parse(await readFile(join(output, 'registry.json'), 'utf8')).items
        .length,
      1
    )
  })
})
