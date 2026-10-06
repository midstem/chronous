import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const MODULE_FILE_NAMES = ['index.js', 'index.d.ts']

const PACKAGES = [
  { name: 'core', fileNames: [...MODULE_FILE_NAMES, 'index.cjs'] },
  { name: 'react', fileNames: [...MODULE_FILE_NAMES, 'index.cjs'] },
  {
    name: 'angular',
    fileNames: [
      'fesm2022/midstem-chronous-angular.mjs',
      'index.d.ts',
      'esm2022/engine.js',
      'engine.d.ts',
      'package.json'
    ]
  },
  { name: 'vue', fileNames: [...MODULE_FILE_NAMES, 'index.cjs'] },
  {
    name: 'svelte',
    fileNames: [...MODULE_FILE_NAMES, 'engine.js', 'engine.d.ts']
  }
]

const PARTIAL_IVY_FILE_NAME =
  'packages/angular/dist/fesm2022/midstem-chronous-angular.mjs'

const PARTIAL_IVY_DECLARATION = 'ngDeclareDirective'

const ANGULAR_BUILD_VERSION = '18.0.0'

const SUBPATH_IMPORT_PREFIX = '#src'

const TEMPORAL_NAMESPACE = 'Temporal'

const TEMPORAL_NAMESPACE_PATTERN = new RegExp(
  `(?<![A-Za-z0-9_$])${TEMPORAL_NAMESPACE}(?![A-Za-z0-9_$])`
)

const CORE_PACKAGE = '@midstem/chronous'

const CORE_SPECIFIER_PATTERN = new RegExp(
  `(?:\\bfrom\\s*|\\bimport\\s*(?:\\(\\s*)?|\\brequire\\s*\\(\\s*)['"]${CORE_PACKAGE}['"]`
)

const failures = []

const check = (description, condition) => {
  if (condition) return

  failures.push(description)
}

const findLines = (content, isLeak) => {
  const numbers = []

  content.split('\n').forEach((line, index) => {
    if (isLeak(line)) numbers.push(index + 1)
  })

  return numbers
}

const bundles = new Map()

PACKAGES.forEach(({ name: packageName, fileNames }) =>
  fileNames.forEach((fileName) => {
    const name = `packages/${packageName}/dist/${fileName}`
    const path = resolve(REPOSITORY_ROOT, name)

    if (!existsSync(path)) {
      failures.push(`${name} is missing, so the build did not run`)

      return
    }

    bundles.set(name, readFileSync(path, 'utf8'))
  })
)

// Svelte ships preprocessed components for the consumer's client/SSR compiler.
// Check every emitted module and declaration, including the embedded engine.
const svelteDist = resolve(REPOSITORY_ROOT, 'packages/svelte/dist')
const readSvelteModules = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      readSvelteModules(path)
    } else if (/\.(?:js|svelte|ts)$/.test(entry.name)) {
      const name = `packages/svelte/dist/${path.slice(svelteDist.length + 1)}`

      bundles.set(name, readFileSync(path, 'utf8'))
    }
  }
}

if (existsSync(svelteDist)) readSvelteModules(svelteDist)

const angularDist = resolve(REPOSITORY_ROOT, 'packages/angular/dist')
const readAngularModules = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      readAngularModules(path)
    } else if (/(?:\.m?js|\.d\.ts)$/.test(entry.name)) {
      const name = `packages/angular/dist/${relative(angularDist, path)}`

      bundles.set(name, readFileSync(path, 'utf8'))
    }
  }
}

if (existsSync(angularDist)) readAngularModules(angularDist)

const angularManifestPath = resolve(angularDist, 'package.json')
if (existsSync(angularManifestPath)) {
  const angularManifest = JSON.parse(readFileSync(angularManifestPath, 'utf8'))
  const hasCoreDependency = [
    angularManifest.dependencies,
    angularManifest.optionalDependencies,
    angularManifest.peerDependencies
  ].some((section) => section?.[CORE_PACKAGE])

  check(
    'packages/angular/dist/package.json still declares @midstem/chronous',
    !hasCoreDependency
  )
}

bundles.forEach((content, name) => {
  const subpathLines = findLines(content, (line) =>
    line.includes(SUBPATH_IMPORT_PREFIX)
  )

  if (
    name.startsWith('packages/react/') ||
    name.startsWith('packages/angular/') ||
    name.startsWith('packages/vue/') ||
    name.startsWith('packages/svelte/')
  ) {
    const coreLines = findLines(content, (line) =>
      CORE_SPECIFIER_PATTERN.test(line)
    )

    check(
      `${name} still resolves ${CORE_PACKAGE} at runtime on lines ${coreLines.join(', ')}, so the engine was not bundled in`,
      !coreLines.length
    )
  }

  check(
    `${name} still carries ${SUBPATH_IMPORT_PREFIX} imports on lines ${subpathLines.join(', ')}`,
    !subpathLines.length
  )

  if (!name.endsWith('.d.ts')) return

  const temporalLines = findLines(content, (line) =>
    TEMPORAL_NAMESPACE_PATTERN.test(line)
  )

  check(
    `${name} names the ${TEMPORAL_NAMESPACE} namespace on lines ${temporalLines.join(', ')}`,
    !temporalLines.length
  )
})

const partialIvy = resolve(REPOSITORY_ROOT, PARTIAL_IVY_FILE_NAME)

check(
  `${PARTIAL_IVY_FILE_NAME} is missing, so the Angular package did not build`,
  existsSync(partialIvy)
)

if (existsSync(partialIvy)) {
  check(
    `${PARTIAL_IVY_FILE_NAME} carries no ${PARTIAL_IVY_DECLARATION}, so the Angular package was not compiled for publishing`,
    readFileSync(partialIvy, 'utf8').includes(PARTIAL_IVY_DECLARATION)
  )
  const compilerVersions = [
    ...readFileSync(partialIvy, 'utf8').matchAll(/version: ["']([^"']+)["']/g)
  ]
  check(
    `${PARTIAL_IVY_FILE_NAME} must be compiled with Angular ${ANGULAR_BUILD_VERSION}`,
    compilerVersions.length > 0 &&
      compilerVersions.every((match) => match[1] === ANGULAR_BUILD_VERSION)
  )
}

if (failures.length) {
  console.error('Build invariants failed:')
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log(`Build invariants hold (${bundles.size} bundles checked).`)
