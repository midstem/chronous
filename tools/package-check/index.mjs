#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile
} from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packages = {
  core: { dir: 'packages/core', name: '@midstem/chronous', minPeers: {} },
  react: {
    dir: 'packages/react',
    name: '@midstem/chronous-react',
    minPeers: {
      react: '18.0.0',
      'react-dom': '18.0.0',
      '@types/react': '18.3.31'
    }
  },
  vue: {
    dir: 'packages/vue',
    name: '@midstem/chronous-vue',
    minPeers: { vue: '3.4.0' }
  },
  svelte: {
    dir: 'packages/svelte',
    name: '@midstem/chronous-svelte',
    minPeers: { svelte: '5.0.0' }
  }
}

export function parseArgs(args) {
  const selected = new Set()
  let minimum = false
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--minimum') {
      if (minimum) throw new Error('--minimum may only be specified once')
      minimum = true
    } else if (arg === '--package') {
      const name = args[++i]
      if (!name || name.startsWith('--'))
        throw new Error('--package requires core, react, vue, or svelte')
      if (!Object.hasOwn(packages, name))
        throw new Error(`Unknown package: ${name}`)
      if (selected.has(name))
        throw new Error(`Package selected more than once: ${name}`)
      selected.add(name)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (minimum && selected.size === 0)
    throw new Error('--minimum requires --package')
  return {
    names: [...(selected.size ? selected : Object.keys(packages))],
    minimum
  }
}

export function assertTarballContents(manifest, files, packageName) {
  const fileSet = new Set(files)
  for (const required of ['package/README.md', 'package/LICENSE']) {
    if (!fileSet.has(required))
      throw new Error(`${packageName} tarball is missing ${required}`)
  }
  const entries = manifest.exports?.['.']
  const entryPaths = new Set(
    [
      manifest.main,
      manifest.module,
      manifest.types,
      manifest.svelte,
      entries?.import,
      entries?.require,
      entries?.svelte,
      entries?.types
    ].filter(Boolean)
  )
  for (const entry of entryPaths) {
    if (!fileSet.has(`package/${entry.replace(/^\.\//, '')}`))
      throw new Error(`${packageName} tarball entrypoint is missing: ${entry}`)
  }
  if (!manifest.types && !entries?.types)
    throw new Error(
      `${packageName} tarball has no public TypeScript declarations`
    )
  if (!manifest.exports?.['.'])
    throw new Error(`${packageName} tarball has no root export`)
  if (files.some((file) => file.startsWith('package/src/')))
    throw new Error(`${packageName} tarball leaks package source files`)
  const adapterDeps = {
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
    ...manifest.peerDependencies
  }
  if (
    packageName !== '@midstem/chronous' &&
    Object.hasOwn(adapterDeps, '@midstem/chronous')
  ) {
    throw new Error(
      `${packageName} declares @midstem/chronous in its dependency or peer dependency sections`
    )
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr]
      .filter(Boolean)
      .join('\n')
      .trim()
    throw new Error(
      `${command} ${args.join(' ')} failed${detail ? `:\n${detail}` : ''}`
    )
  }
  return result.stdout
}

async function rootVersion(specifier) {
  const req = createRequire(path.join(root, 'package.json'))
  const manifest = JSON.parse(
    await readFile(req.resolve(`${specifier}/package.json`), 'utf8')
  )
  return manifest.version
}

async function stageTarball(config, temp) {
  const source = path.join(root, config.dir)
  const stage = path.join(temp, 'package')
  await mkdir(stage, { recursive: true })
  await cp(source, stage, {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}node_modules${path.sep}`)
  })
  await cp(path.join(root, 'LICENSE'), path.join(stage, 'LICENSE'))
  const result = JSON.parse(
    run(
      'npm',
      [
        '--cache',
        path.join(temp, 'npm-cache'),
        'pack',
        stage,
        '--ignore-scripts',
        '--json',
        '--pack-destination',
        temp
      ],
      { cwd: temp }
    )
  )
  if (!result[0]?.filename)
    throw new Error(`npm pack did not return an archive for ${config.name}`)
  return path.join(temp, result[0].filename)
}

async function installConsumer(config, archive, temp, minimum) {
  const consumer = path.join(temp, 'consumer')
  await mkdir(consumer, { recursive: true })
  const deps = {}
  if (minimum) {
    Object.assign(deps, config.minPeers)
    if (config.name === '@midstem/chronous-react')
      deps['react-dom'] = config.minPeers['react-dom']
  } else {
    for (const peer of Object.keys(config.minPeers))
      deps[peer] = await rootVersion(peer)
    if (config.name === '@midstem/chronous-react')
      deps['react-dom'] = await rootVersion('react-dom')
  }
  if (minimum) {
    await writeFile(
      path.join(consumer, 'package.json'),
      JSON.stringify(
        {
          name: 'chronous-package-consumer',
          private: true,
          type: 'module',
          dependencies: deps
        },
        null,
        2
      )
    )
    run(
      'npm',
      [
        '--cache',
        path.join(temp, 'npm-cache'),
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false'
      ],
      { cwd: consumer }
    )
  } else {
    await writeFile(
      path.join(consumer, 'package.json'),
      JSON.stringify(
        { name: 'chronous-package-consumer', private: true, type: 'module' },
        null,
        2
      )
    )
    const modules = path.join(consumer, 'node_modules')
    await mkdir(modules, { recursive: true })
    for (const peer of Object.keys(deps)) {
      const target = path.join(modules, peer)
      await mkdir(path.dirname(target), { recursive: true })
      await symlink(path.join(root, 'node_modules', peer), target, 'dir')
    }
  }
  const modules = path.join(consumer, 'node_modules')
  await mkdir(modules, { recursive: true })
  // Consumers use the root's installed TypeScript tool, while imports resolve from this project's node_modules.
  await symlink(
    path.join(root, 'node_modules/.bin'),
    path.join(modules, '.bin'),
    'dir'
  ).catch((error) => {
    if (error.code !== 'EEXIST') throw error
  })
  run(
    'npm',
    [
      '--cache',
      path.join(temp, 'npm-cache'),
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...(minimum ? [] : ['--offline']),
      '--no-save',
      '--package-lock=false',
      archive
    ],
    { cwd: consumer }
  )
  if (!minimum) {
    for (const peer of Object.keys(deps)) {
      const target = path.join(modules, peer)
      await mkdir(path.dirname(target), { recursive: true })
      await symlink(path.join(root, 'node_modules', peer), target, 'dir').catch(
        (error) => {
          if (error.code !== 'EEXIST') throw error
        }
      )
    }
  }
  await symlink(
    path.join(root, 'node_modules/.bin'),
    path.join(modules, '.bin'),
    'dir'
  ).catch((error) => {
    if (error.code !== 'EEXIST') throw error
  })
  return consumer
}

async function verifyArchive(config, archive) {
  const listing = run('tar', ['-tzf', archive]).trim().split('\n')
  const packageJson = run('tar', ['-xOzf', archive, 'package/package.json'])
  const manifest = JSON.parse(packageJson)
  if (manifest.name !== config.name)
    throw new Error(
      `Expected ${config.name} tarball, received ${manifest.name}`
    )
  assertTarballContents(manifest, listing, config.name)
  const sourceFiles = listing.filter((file) =>
    /package\/dist\/.*\.(?:js|cjs|d\.ts)$/.test(file)
  )
  for (const file of sourceFiles) {
    const body = run('tar', ['-xOzf', archive, file])
    if (
      /(?:from\s*|import\s*\(|require\s*\()\s*['"]@midstem\/chronous(?:['/]|$)/.test(
        body
      )
    ) {
      throw new Error(
        `${config.name} runtime bundle resolves @midstem/chronous externally (${file})`
      )
    }
  }
  return manifest
}

function typedConsumerSource(name) {
  const common = `import { buildCalendar } from '${name}'
import type { CalendarRange, EventInput } from '${name}'
const range: CalendarRange = { view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' }
const events: EventInput[] = [{ id: 'meeting', start: '2026-03-18T09:00', duration: 'PT30M' }]
buildCalendar(range, events)
`
  if (name === '@midstem/chronous') return common
  if (name === '@midstem/chronous-react')
    return `${common}import React from 'react'
import { Calendar } from '${name}'
const calendar = <Calendar.Root range={range} events={events}><Calendar.DayHeadings /></Calendar.Root>
void React; void calendar
`
  if (name === '@midstem/chronous-vue')
    return `${common}import { h, type VNode } from 'vue'
import { Calendar } from '${name}'
const calendar: VNode = h(Calendar.Root, { range, events }, { default: () => h(Calendar.DayHeadings) })
void calendar
`
  return `${common}import { Calendar } from '${name}'
const root: typeof Calendar.Root = Calendar.Root
void root
`
}

async function writeConsumers(config, consumer) {
  const extension = config.name.endsWith('-react') ? 'tsx' : 'ts'
  await writeFile(
    path.join(consumer, `public-api.${extension}`),
    typedConsumerSource(config.name)
  )
  const esmBundlerTypes = config.name === '@midstem/chronous-svelte'
  const flags = [
    '--noEmit',
    '--strict',
    '--target',
    'ES2022',
    '--module',
    esmBundlerTypes ? 'ESNext' : 'NodeNext',
    '--moduleResolution',
    esmBundlerTypes ? 'Bundler' : 'NodeNext'
  ]
  if (extension === 'tsx') flags.push('--jsx', 'react-jsx')
  run(
    path.join(root, 'node_modules/.bin/tsc'),
    [...flags, path.join(consumer, `public-api.${extension}`)],
    { cwd: consumer }
  )
  await writeFile(
    path.join(consumer, 'runtime.mjs'),
    runtimeSource(config.name)
  )
}

function runtimeSource(name) {
  const temporal = "import 'temporal-polyfill/global'\n"
  if (name === '@midstem/chronous')
    return `${temporal}
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import * as esm from '@midstem/chronous'
const require = createRequire(import.meta.url)
const cjs = require('@midstem/chronous')
assert.equal(typeof esm.buildCalendar, 'function')
assert.equal(typeof cjs.buildCalendar, 'function')
const result = esm.buildCalendar({ view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' }, [])
assert.equal(result.days.length, 7)
console.log('core ESM/CJS runtime and buildCalendar passed')
`
  if (name === '@midstem/chronous-react')
    return `${temporal}
import assert from 'node:assert/strict'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Calendar } from '@midstem/chronous-react'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const cjs = require('@midstem/chronous-react')
assert.equal(typeof cjs.Calendar.Root, 'function')
assert.throws(() => require.resolve('@midstem/chronous'), { code: 'MODULE_NOT_FOUND' })
const html = renderToString(React.createElement(Calendar.Root, { range: { view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' }, events: [] }, React.createElement(Calendar.DayHeadings)))
assert.match(html, /data-date="2026-03-18"/)
console.log('React installed archive ESM/CJS SSR passed')
`
  if (name === '@midstem/chronous-vue')
    return `${temporal}
import assert from 'node:assert/strict'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Calendar } from '@midstem/chronous-vue'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const cjs = require('@midstem/chronous-vue')
assert.equal(typeof cjs.Calendar.Root, 'object')
assert.throws(() => require.resolve('@midstem/chronous'), { code: 'MODULE_NOT_FOUND' })
const app = createSSRApp(h(Calendar.Root, { range: { view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' }, events: [] }, { default: () => h(Calendar.DayHeadings) }))
const html = await renderToString(app)
assert.match(html, /data-date="2026-03-18"/)
console.log('Vue installed archive ESM/CJS SSR passed')
`
  return `${temporal}
import assert from 'node:assert/strict'
import { compile, preprocess } from 'svelte/compiler'
import { render } from 'svelte/server'
import ts from 'typescript'
import { build } from 'vite'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
assert.throws(() => require.resolve('@midstem/chronous'), { code: 'MODULE_NOT_FOUND' })
const filename = new URL('./consumer.svelte', import.meta.url)
const source = await (await import('node:fs/promises')).readFile(filename, 'utf8')
await compileSvelte(source, filename.pathname, 'client')
await compileSvelte(source, filename.pathname, 'server')
function compilerPlugin(compiledFiles) {
  return {
  name: 'consumer-svelte-compiler',
  enforce: 'pre',
  async transform(code, id, options) {
    const filename = id.split('?')[0]
    if (!filename.endsWith('.svelte')) return null
    compiledFiles.add(filename)
    return compileSvelte(code, filename, options?.ssr ? 'server' : 'client')
  }
  }
}
async function compileSvelte(source, filename, generate) {
  const processed = await preprocess(source, [{
    script({ content, attributes }) {
      if (attributes.lang !== 'ts') return null
      return { code: ts.transpileModule(content, { compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true } }).outputText }
    }
  }], { filename })
  return compile(processed.code, { filename, generate }).js.code
}
const entry = new URL('./ssr-entry.mjs', import.meta.url)
await writeFile(entry, ['import Consumer from "./consumer.svelte"', 'export default Consumer', ''].join(String.fromCharCode(10)))
const external = (id) => id === 'svelte' || id.startsWith('svelte/')
const clientComponents = new Set()
await build({
  configFile: false,
  root: new URL('.', import.meta.url).pathname,
  plugins: [compilerPlugin(clientComponents)],
  build: { outDir: 'client-build', emptyOutDir: true, rollupOptions: { input: filename.pathname, external } }
})
if (![...clientComponents].some((id) => id.includes('/node_modules/@midstem/chronous-svelte/dist/'))) throw new Error('Client build did not compile packaged Svelte components')
const ssrComponents = new Set()
await build({
  configFile: false,
  root: new URL('.', import.meta.url).pathname,
  plugins: [compilerPlugin(ssrComponents)],
  ssr: { noExternal: ['@midstem/chronous-svelte'] },
  build: { ssr: entry.pathname, outDir: 'ssr-build', emptyOutDir: true, rollupOptions: { external, output: { format: 'es', entryFileNames: 'consumer-ssr.mjs' } } }
})
if (![...ssrComponents].some((id) => id.includes('/node_modules/@midstem/chronous-svelte/dist/'))) throw new Error('SSR build did not compile packaged Svelte components')
const { default: Consumer } = await import('./ssr-build/consumer-ssr.mjs')
const { body } = render(Consumer, { props: { range: { view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' }, events: [] } })
assert.match(body, /data-date="2026-03-18"/)
console.log('Svelte installed archive client/server compile and SSR passed')
`
}

async function runConsumer(config, archive, temp, minimum) {
  const consumer = await installConsumer(config, archive, temp, minimum)
  if (config.name === '@midstem/chronous-svelte') {
    for (const tool of ['vite', 'typescript']) {
      const target = path.join(consumer, 'node_modules', tool)
      await mkdir(path.dirname(target), { recursive: true })
      await symlink(path.join(root, 'node_modules', tool), target, 'dir')
    }
  }
  // The runtime fixture imports the already-installed polyfill from this external consumer.
  await symlink(
    path.join(root, 'node_modules/temporal-polyfill'),
    path.join(consumer, 'node_modules/temporal-polyfill'),
    'dir'
  )
  if (config.name === '@midstem/chronous-svelte') {
    await writeFile(
      path.join(consumer, 'consumer.svelte'),
      `<script>\n  import { Calendar } from '@midstem/chronous-svelte'\n  let { range, events } = $props()\n</script>\n<Calendar.Root {range} {events}>\n  {#snippet children()}\n    <Calendar.DayHeadings />\n  {/snippet}\n</Calendar.Root>\n`
    )
  }
  await writeConsumers(config, consumer)
  run(process.execPath, [path.join(consumer, 'runtime.mjs')], { cwd: consumer })
}

export async function runChecks({ names, minimum }) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'chronous-package-check-'))
  try {
    for (const name of names) {
      const config = packages[name]
      const packageTemp = path.join(temp, name)
      await mkdir(packageTemp, { recursive: true })
      const archive = await stageTarball(config, packageTemp)
      await verifyArchive(config, archive)
      await runConsumer(config, archive, packageTemp, minimum)
      console.log(`✓ ${name}${minimum ? ' (minimum peers)' : ''}`)
    }
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    await runChecks(parseArgs(process.argv.slice(2)))
  } catch (error) {
    console.error(`Package check failed: ${error.message}`)
    process.exitCode = 1
  }
}
