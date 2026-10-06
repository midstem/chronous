import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ngPackagr } from 'ng-packagr'
import { embedCore } from './embed-core.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const PACKAGE = resolve(ROOT, 'packages/angular')
const toolRequire = createRequire(import.meta.url)
const angularTypes = resolve(
  dirname(toolRequire.resolve('@angular/core/package.json')),
  'index.d.ts'
)
const temporary = mkdtempSync(resolve(tmpdir(), 'chronous-angular-build-'))
const manifest = JSON.parse(
  readFileSync(resolve(PACKAGE, 'package.json'), 'utf8')
)

// ng-packagr generates paths relative to its output; the publishable workspace
// keeps its own exports pointing into dist. Use a separate input manifest.
const { name, version, license, peerDependencies, dependencies } = manifest
writeFileSync(
  resolve(temporary, 'package.json'),
  JSON.stringify({ name, version, license, peerDependencies, dependencies })
)
writeFileSync(
  resolve(temporary, 'ng-package.json'),
  JSON.stringify({
    dest: relative(temporary, resolve(PACKAGE, 'dist')),
    lib: { entryFile: resolve(PACKAGE, 'src/index.ts') }
  })
)
writeFileSync(
  resolve(temporary, 'tsconfig.json'),
  JSON.stringify({
    extends: resolve(PACKAGE, 'tsconfig.build.json'),
    compilerOptions: {
      paths: {
        '@angular/core': [angularTypes],
        '@midstem/chronous': [resolve(ROOT, 'packages/core/dist/index.d.ts')]
      }
    }
  })
)

try {
  await ngPackagr()
    .forProject(resolve(temporary, 'ng-package.json'))
    .withTsConfig(resolve(temporary, 'tsconfig.json'))
    .build({ cacheEnabled: false })
  await embedCore(resolve(PACKAGE, 'dist'), resolve(ROOT, 'packages/core/dist'))
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
