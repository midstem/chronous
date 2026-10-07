import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_OUTPUT = 'dist-registry/r'

const parseArguments = (arguments_) => {
  if (arguments_.length === 0) return DEFAULT_OUTPUT
  if (arguments_.length === 2 && arguments_[0] === '--output') {
    return arguments_[1]
  }
  throw new Error('Usage: node tools/registry/build.mjs [--output <directory>]')
}

export async function buildRegistry({
  root = ROOT,
  output = DEFAULT_OUTPUT
} = {}) {
  const registryPath = resolve(root, 'registry.json')
  const registry = JSON.parse(await readFile(registryPath, 'utf8'))
  if (!Array.isArray(registry.items)) {
    throw new Error('registry.json must include an items array')
  }
  for (const item of registry.items) {
    if (typeof item.name !== 'string' || !Array.isArray(item.files)) {
      throw new Error('Each registry item must include a name and files array')
    }
  }
  const outputPath = isAbsolute(output) ? output : resolve(root, output)
  await mkdir(outputPath, { recursive: true })

  for (const item of registry.items ?? []) {
    const files = await Promise.all(
      item.files.map(async (file) => ({
        ...file,
        content: await readFile(resolve(root, file.path), 'utf8')
      }))
    )
    await writeFile(
      resolve(outputPath, `${item.name}.json`),
      `${JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema/registry-item.json',
          ...item,
          files
        },
        null,
        2
      )}\n`
    )
  }

  await writeFile(
    resolve(outputPath, 'registry.json'),
    `${JSON.stringify(registry, null, 2)}\n`
  )
  return outputPath
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const output = parseArguments(process.argv.slice(2))
  await buildRegistry({ output })
  console.error(`built ${output}`)
}
