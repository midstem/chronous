import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const PACKAGE_DIRECTORIES = ['core', 'react']

const BOTH = 'both'

const [selection = BOTH] = process.argv.slice(2)

const manifests = PACKAGE_DIRECTORIES.map((directory) =>
  JSON.parse(
    readFileSync(
      resolve(REPOSITORY_ROOT, 'packages', directory, 'package.json'),
      'utf8'
    )
  )
)

const selected =
  selection === BOTH
    ? manifests
    : manifests.filter((manifest) => manifest.name === selection)

if (!selected.length) {
  console.error(`No package named "${selection}" in packages/.`)
  process.exit(1)
}

console.log(`names=${selected.map((manifest) => manifest.name).join(' ')}`)
console.log(
  `tags=${selected.map((manifest) => `${manifest.name}@${manifest.version}`).join(' ')}`
)
