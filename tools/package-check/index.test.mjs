import assert from 'node:assert/strict'
import test from 'node:test'
import { assertTarballContents, parseArgs } from './index.mjs'

const manifest = {
  name: '@midstem/chronous-react',
  main: './dist/index.cjs',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  exports: {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs'
    }
  },
  peerDependencies: { react: '>=18' }
}
const files = [
  'package/README.md',
  'package/LICENSE',
  'package/dist/index.cjs',
  'package/dist/index.js',
  'package/dist/index.d.ts'
]

test('defaults to all supported packable frameworks', () => {
  assert.deepEqual(parseArgs([]), {
    names: ['core', 'react', 'vue', 'svelte'],
    minimum: false
  })
})

test('selects one package and minimum peer mode', () => {
  assert.deepEqual(parseArgs(['--package', 'vue', '--minimum']), {
    names: ['vue'],
    minimum: true
  })
})

test('rejects unknown package and options', () => {
  assert.throws(() => parseArgs(['--package', 'angular']), /Unknown package/)
  assert.throws(() => parseArgs(['--bogus']), /Unknown argument/)
  assert.throws(() => parseArgs(['--minimum']), /requires --package/)
})

test('accepts a complete archive and rejects omitted declarations or entrypoints', () => {
  assert.doesNotThrow(() =>
    assertTarballContents(manifest, files, manifest.name)
  )
  assert.throws(
    () =>
      assertTarballContents(
        {
          ...manifest,
          types: undefined,
          exports: {
            '.': { import: './dist/index.js', require: './dist/index.cjs' }
          }
        },
        files,
        manifest.name
      ),
    /no public TypeScript declarations/
  )
  assert.throws(
    () =>
      assertTarballContents(
        manifest,
        files.filter((file) => !file.endsWith('index.js')),
        manifest.name
      ),
    /entrypoint is missing/
  )
})

test('rejects a leaked core dependency and source files', () => {
  assert.throws(
    () =>
      assertTarballContents(
        { ...manifest, dependencies: { '@midstem/chronous': '*' } },
        files,
        manifest.name
      ),
    /declares @midstem\/chronous/
  )
  assert.throws(
    () =>
      assertTarballContents(
        manifest,
        [...files, 'package/src/index.ts'],
        manifest.name
      ),
    /leaks package source/
  )
})
