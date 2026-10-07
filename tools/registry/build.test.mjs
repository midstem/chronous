import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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

    assert.equal(catalog.items[0].name, 'chronous-calendar')
    assert.deepEqual(item.dependencies, [
      '@midstem/chronous-react@^1.0.2',
      'temporal-polyfill@^1.0.4'
    ])
    assert.deepEqual(item.registryDependencies, ['button'])
    assert.equal(item.files[0].target, '@ui/chronous-calendar.tsx')
    assert.equal(
      item.$schema,
      'https://ui.shadcn.com/schema/registry-item.json'
    )
    assert.equal(
      item.files[0].content,
      await readFile(
        join(root, 'registry/default/chronous-calendar/chronous-calendar.tsx'),
        'utf8'
      )
    )
    assert.match(item.files[0].content, /useCalendarNavigation/)
    assert.match(item.files[0].content, /from '@\/components\/ui\/button'/)
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

  it('fails when a source file declared by the catalog is missing', async () => {
    const root = await temporaryDirectory()
    await writeFile(
      join(root, 'registry.json'),
      JSON.stringify({
        items: [{ name: 'missing', files: [{ path: 'missing.tsx' }] }]
      })
    )

    await assert.rejects(buildRegistry({ root, output: 'out' }), /missing\.tsx/)
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
