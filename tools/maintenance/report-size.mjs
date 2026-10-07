import { gzipSync } from 'node:zlib'
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const metricDefinitions = {
  bundling:
    'esbuild bundles of each built dist entrypoint, minified for browser ESM; framework packages are external. Bytes are JavaScript output bytes and gzipSync-compressed bytes.',
  svelteClient:
    'esbuild browser bundle of a consumer importing only Calendar from the built Svelte package; .svelte modules are compiled with svelte/compiler for client rendering and svelte plus svelte/* runtime imports are external. This is a compiled consumer bundle, not gzip of published component files.'
}

function dependencies(root) {
  const angularBuildRequire = createRequire(
    resolve(root, 'tools/angular-build/package.json')
  )
  const svelteRequire = createRequire(
    resolve(root, 'packages/svelte/package.json')
  )
  return {
    esbuild: angularBuildRequire('esbuild'),
    compileSvelte: svelteRequire('svelte/compiler').compile
  }
}

export function measureCode(code) {
  return {
    bytes: Buffer.byteLength(code),
    gzipBytes: gzipSync(code, { level: 9, mtime: 0 }).byteLength
  }
}

async function bundle(esbuild, options) {
  const result = await esbuild.build({
    ...options,
    bundle: true,
    minify: true,
    platform: 'browser',
    format: 'esm',
    write: false,
    outfile: 'bundle.js',
    sourcemap: false,
    legalComments: 'none',
    logLevel: 'silent'
  })
  const javascript = result.outputFiles
    .filter((file) => file.path.endsWith('.js'))
    .map((file) => file.text)
    .join('\n')
  if (!javascript) throw new Error('esbuild produced no JavaScript output')
  return measureCode(javascript)
}

export async function measureRepository(root = scriptRoot) {
  root = resolve(root)
  const { esbuild, compileSvelte } = dependencies(root)
  const packageRoot = (name, file) =>
    resolve(root, 'packages', name, 'dist', file)
  const measures = {
    core: await bundle(esbuild, {
      entryPoints: [packageRoot('core', 'index.js')]
    }),
    react: await bundle(esbuild, {
      entryPoints: [packageRoot('react', 'index.js')],
      external: ['react', 'react-dom']
    }),
    vue: await bundle(esbuild, {
      entryPoints: [packageRoot('vue', 'index.js')],
      external: ['vue']
    }),
    angular: await bundle(esbuild, {
      entryPoints: [
        packageRoot('angular', 'fesm2022/midstem-chronous-angular.mjs')
      ],
      external: ['@angular/*', 'rxjs', 'rxjs/*']
    }),
    svelteClient: await bundle(esbuild, {
      stdin: {
        contents:
          "import { Calendar } from './packages/svelte/dist/index.js'; export { Calendar }",
        resolveDir: root,
        sourcefile: 'chronous-svelte-consumer.js',
        loader: 'js'
      },
      external: ['svelte', 'svelte/*'],
      plugins: [
        {
          name: 'compile-svelte-client',
          setup(build) {
            build.onLoad({ filter: /\.svelte$/ }, async (args) => {
              const source = await readFile(args.path, 'utf8')
              const result = compileSvelte(source, {
                filename: args.path,
                generate: 'client',
                dev: false
              })
              return {
                contents: result.js.code,
                loader: 'js',
                resolveDir: dirname(args.path)
              }
            })
          }
        }
      ]
    })
  }

  return {
    schemaVersion: 1,
    definitions: metricDefinitions,
    metrics: measures
  }
}

function signed(value) {
  return `${value > 0 ? '+' : ''}${value}`
}

function sizeLabel(metric) {
  return `${metric.gzipBytes} B gzip (${metric.bytes} B minified)`
}

export function formatReport(current, baseline = undefined) {
  const names = [
    ...new Set([
      ...Object.keys(current.metrics ?? {}),
      ...Object.keys(baseline?.metrics ?? {})
    ])
  ]
  const lines = [
    '## Package size',
    '',
    '| Package | Current | Change from base |',
    '| --- | ---: | ---: |'
  ]

  for (const name of names) {
    const now = current.metrics?.[name]
    const before = baseline?.metrics?.[name]
    if (!now) {
      lines.push(`| ${name} | Removed | — |`)
      continue
    }
    if (!baseline) {
      lines.push(`| ${name} | ${sizeLabel(now)} | — |`)
      continue
    }
    if (!before) {
      lines.push(`| ${name} | ${sizeLabel(now)} | New package |`)
      continue
    }
    const delta = now.gzipBytes - before.gzipBytes
    const percent =
      before.gzipBytes === 0
        ? ' (baseline 0 B)'
        : ` (${signed(Number(((delta / before.gzipBytes) * 100).toFixed(1)))}%)`
    lines.push(
      `| ${name} | ${sizeLabel(now)} | ${signed(delta)} B gzip${percent} |`
    )
  }

  lines.push('', `Svelte measurement: ${metricDefinitions.svelteClient}`)
  return `${lines.join('\n')}\n`
}

function parseArgs(args) {
  const options = { root: scriptRoot }
  for (let i = 0; i < args.length; i += 1) {
    if (['--root', '--json', '--current', '--base'].includes(args[i])) {
      const flag = args[i]
      const value = args[++i]
      if (!value || value.startsWith('--'))
        throw new Error(`${flag} requires a path`)
      const key = {
        '--root': 'root',
        '--json': 'json',
        '--current': 'current',
        '--base': 'base'
      }[flag]
      if (options[key] !== undefined && key !== 'root')
        throw new Error(`${flag} may only be supplied once`)
      options[key] = resolve(value)
    } else throw new Error(`Unknown argument: ${args[i]}`)
  }
  if (options.current && options.json)
    throw new Error('Use either --current or --json, not both')
  if (options.base && !options.current)
    throw new Error('--base requires --current')
  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.current) {
    const current = JSON.parse(await readFile(options.current, 'utf8'))
    const baseline = options.base
      ? JSON.parse(await readFile(options.base, 'utf8'))
      : undefined
    process.stdout.write(formatReport(current, baseline))
    return
  }

  const manifest = await measureRepository(options.root)
  const json = `${JSON.stringify(manifest, null, 2)}\n`
  if (options.json) await writeFile(options.json, json)
  else process.stdout.write(formatReport(manifest))
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
