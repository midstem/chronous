import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  formatDiagnostics,
  performCompilation,
  readConfiguration
} from '@angular/compiler-cli'
import linker from '@angular/compiler-cli/linker/babel'
import { transformAsync } from '@babel/core'
import { build } from 'esbuild'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const toolRequire = createRequire(
  resolve(ROOT, 'tools/angular-build/package.json')
)

function readReadmeExample() {
  const readme = readFileSync(
    resolve(ROOT, 'packages/angular/README.md'),
    'utf8'
  )
  const example = readme.match(/```ts\n([\s\S]*?)\n```/)?.[1]
  if (!example) {
    throw new Error('Angular README must contain the basic usage example')
  }
  return example
}

function writeConsumerSources(directory, example) {
  writeFileSync(resolve(directory, 'app.ts'), example)
  writeFileSync(
    resolve(directory, 'main.ts'),
    `
import 'temporal-polyfill/global'
import { provideExperimentalZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { BoardComponent } from './app'

bootstrapApplication(BoardComponent, {
  providers: [provideExperimentalZonelessChangeDetection()]
}).then(ref => {
  const board = ref.components[0].instance as BoardComponent
  const smoke = window as unknown as { chronousSmoke: (command: string) => void }
  smoke.chronousSmoke = command => {
    if (command === 'events') {
      board.events.set([
        { id: 'updated-event', start: '2026-03-18T11:00', duration: 'PT1H' }
      ])
    }
    if (command === 'range') {
      board.range.update(range => ({ ...range, currentDate: '2026-03-25' }))
    }
  }
})
`
  )
}

function angularTypeEntry(packageName) {
  return toolRequire
    .resolve(`${packageName}/package.json`)
    .replace('package.json', 'index.d.ts')
}

function writeConsumerTsconfig(directory, angularPackage) {
  writeFileSync(
    resolve(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        types: [],
        skipLibCheck: false,
        experimentalDecorators: true,
        outDir: './compiled',
        paths: {
          '@angular/core': [angularTypeEntry('@angular/core')],
          '@angular/platform-browser': [
            angularTypeEntry('@angular/platform-browser')
          ],
          '@midstem/chronous-angular': [
            resolve(angularPackage, 'dist/index.d.ts')
          ]
        }
      },
      angularCompilerOptions: {
        strictTemplates: true,
        compilationMode: 'full'
      },
      files: ['main.ts', 'app.ts']
    })
  )
}

function compileConsumer(directory) {
  const config = readConfiguration(resolve(directory, 'tsconfig.json'))
  const { diagnostics } = performCompilation({
    rootNames: config.rootNames,
    options: config.options
  })
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === 1)
  if (config.errors.length || errors.length) {
    throw new Error(formatDiagnostics([...config.errors, ...errors]))
  }
}

function packageConsumerPlugin(angularPackage) {
  const angularModule = JSON.parse(
    readFileSync(resolve(angularPackage, 'package.json'), 'utf8')
  ).module

  return {
    name: 'angular18-package-consumer',
    setup(builder) {
      builder.onResolve({ filter: /^@midstem\/chronous-angular$/ }, () => ({
        path: resolve(angularPackage, angularModule)
      }))
      builder.onResolve({ filter: /^@angular\// }, (args) => ({
        path: toolRequire.resolve(args.path)
      }))
      builder.onResolve({ filter: /^temporal-polyfill\/global$/ }, (args) => ({
        path: toolRequire.resolve(args.path)
      }))
      builder.onLoad({ filter: /\.[cm]?js$/ }, async (args) => {
        const code = readFileSync(args.path, 'utf8')
        if (!code.includes('ɵɵngDeclare')) return null

        const linked = await transformAsync(code, {
          filename: args.path,
          plugins: [linker],
          configFile: false,
          babelrc: false
        })
        return {
          contents: linked.code,
          loader: 'js',
          resolveDir: dirname(args.path)
        }
      })
    }
  }
}

async function bundleConsumer(directory, angularPackage) {
  await build({
    entryPoints: [resolve(directory, 'compiled/main.js')],
    bundle: true,
    format: 'esm',
    outfile: resolve(directory, 'main.js'),
    define: { ngDevMode: 'false', ngJitMode: 'false' },
    plugins: [packageConsumerPlugin(angularPackage)]
  })
}

export async function buildMinimumConsumer(directory, angularPackage) {
  mkdirSync(directory, { recursive: true })
  writeConsumerSources(directory, readReadmeExample())
  writeConsumerTsconfig(directory, angularPackage)
  compileConsumer(directory)
  await bundleConsumer(directory, angularPackage)
  writeFileSync(
    resolve(directory, 'index.html'),
    '<app-board></app-board><script type="module" src="/main.js"></script>'
  )
}
