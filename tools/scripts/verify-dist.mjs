import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const PACKAGE_NAMES = ['core', 'react']

const BUNDLE_FILE_NAMES = ['index.js', 'index.cjs', 'index.d.ts']

const SUBPATH_IMPORT_PREFIX = '#src'

const TEMPORAL_NAMESPACE = 'Temporal'

const TEMPORAL_PROBE_NAME = 'isTemporalAvailable'

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

PACKAGE_NAMES.forEach((packageName) =>
  BUNDLE_FILE_NAMES.forEach((fileName) => {
    const name = `packages/${packageName}/dist/${fileName}`
    const path = resolve(REPOSITORY_ROOT, name)

    if (!existsSync(path)) {
      failures.push(`${name} is missing, so the build did not run`)

      return
    }

    bundles.set(name, readFileSync(path, 'utf8'))
  })
)

bundles.forEach((content, name) => {
  const subpathLines = findLines(content, (line) =>
    line.includes(SUBPATH_IMPORT_PREFIX)
  )

  check(
    `${name} still carries ${SUBPATH_IMPORT_PREFIX} imports on lines ${subpathLines.join(', ')}`,
    !subpathLines.length
  )

  if (!name.endsWith('.d.ts')) return

  const temporalLines = findLines(content, (line) =>
    line.replaceAll(TEMPORAL_PROBE_NAME, '').includes(TEMPORAL_NAMESPACE)
  )

  check(
    `${name} names ${TEMPORAL_NAMESPACE} outside ${TEMPORAL_PROBE_NAME} on lines ${temporalLines.join(', ')}`,
    !temporalLines.length
  )
})

if (failures.length) {
  console.error('Build invariants failed:')
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log(`Build invariants hold (${bundles.size} bundles checked).`)
