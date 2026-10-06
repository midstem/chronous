import { copyFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { rollup } from '@rollup/wasm-node'

const CORE_PACKAGE = '@midstem/chronous'
const CORE_SPECIFIER =
  /((?:\bfrom|\bimport)\s*(?:\(\s*)?)(['"])@midstem\/chronous\2/g

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function moduleSpecifier(fromFile, toFile) {
  let specifier = relative(dirname(fromFile), toFile).split(sep).join('/')
  if (!specifier.startsWith('.')) specifier = `./${specifier}`
  return specifier
}

function rewriteCoreImports(source, fromFile, toFile) {
  return source.replace(CORE_SPECIFIER, (_match, syntax, quote) => {
    return `${syntax}${quote}${moduleSpecifier(fromFile, toFile)}${quote}`
  })
}

function removeStaleSourceMap(source) {
  return source.replace(/\n?\/\/# sourceMappingURL=.*?(?:\r?\n|$)/g, '')
}

function rewriteAngularModules(angularDist, embeddedModule) {
  const esmDirectory = resolve(angularDist, 'esm2022')
  for (const path of walk(esmDirectory)) {
    if (!/\.m?js$/.test(path)) continue
    const source = readFileSync(path, 'utf8')
    const rewritten = rewriteCoreImports(source, path, embeddedModule)
    if (rewritten !== source) {
      writeFileSync(path, removeStaleSourceMap(rewritten))
    }
  }
}

function rewriteAngularDeclarations(angularDist, embeddedTypes) {
  for (const path of walk(angularDist)) {
    if (!path.endsWith('.d.ts') || path === embeddedTypes) continue
    const source = readFileSync(path, 'utf8')
    const rewritten = rewriteCoreImports(
      source,
      path,
      embeddedTypes.slice(0, -'.d.ts'.length)
    )
    if (rewritten !== source) writeFileSync(path, rewritten)
  }
}

async function bundleCoreIntoAngular(angularBundle, coreEntry) {
  const bundle = await rollup({
    input: angularBundle,
    treeshake: false,
    plugins: [
      {
        name: 'embed-chronous-core',
        resolveId(source) {
          if (source === CORE_PACKAGE) return coreEntry
          if (source.startsWith('.') || isAbsolute(source)) return null
          return { id: source, external: true }
        }
      }
    ]
  })

  try {
    await bundle.write({ file: angularBundle, format: 'es', sourcemap: true })
  } finally {
    await bundle.close()
  }
}

export async function embedCore(angularDist, coreDist) {
  const angularBundle = resolve(
    angularDist,
    'fesm2022/midstem-chronous-angular.mjs'
  )
  const coreEntry = resolve(coreDist, 'index.js')
  const embeddedModule = resolve(angularDist, 'esm2022/engine.js')
  const embeddedTypes = resolve(angularDist, 'engine.d.ts')

  await bundleCoreIntoAngular(angularBundle, coreEntry)
  writeFileSync(
    embeddedModule,
    removeStaleSourceMap(readFileSync(coreEntry, 'utf8'))
  )
  copyFileSync(resolve(coreDist, 'index.d.ts'), embeddedTypes)
  rewriteAngularModules(angularDist, embeddedModule)
  rewriteAngularDeclarations(angularDist, embeddedTypes)
}
