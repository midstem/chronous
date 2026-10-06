import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { buildMinimumConsumer } from './minimum-consumer.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function runNpm(args, options = {}) {
  execFileSync(npm, args, { cwd: ROOT, stdio: 'inherit', ...options })
}

function copyAngularLicense() {
  copyFileSync(
    resolve(ROOT, 'LICENSE'),
    resolve(ROOT, 'packages/angular/LICENSE')
  )
}

function packAngularPackage(directory) {
  const result = execFileSync(
    npm,
    [
      'pack',
      '--workspace',
      '@midstem/chronous-angular',
      '--ignore-scripts',
      '--pack-destination',
      directory,
      '--json',
      '--cache',
      resolve(directory, 'cache')
    ],
    { cwd: ROOT, encoding: 'utf8' }
  )
  return JSON.parse(result)
}

function angularArchive(directory, packages) {
  const entry = packages.find(
    (item) => item.name === '@midstem/chronous-angular'
  )
  if (!entry)
    throw new Error('npm pack did not produce @midstem/chronous-angular')
  return resolve(directory, entry.filename)
}

function assertArchiveHasNoCoreDependency(archive) {
  const manifest = JSON.parse(
    execFileSync('tar', ['-xOf', archive, 'package/package.json'], {
      encoding: 'utf8'
    })
  )
  const dependencySections = [
    manifest.dependencies,
    manifest.optionalDependencies,
    manifest.peerDependencies
  ]
  if (dependencySections.some((section) => section?.['@midstem/chronous'])) {
    throw new Error('Angular npm archive still declares @midstem/chronous')
  }
}

function installAngularArchive(directory, archive) {
  writeFileSync(
    resolve(directory, 'package.json'),
    '{"private":true,"type":"module"}'
  )
  runNpm(
    [
      'install',
      '--ignore-scripts',
      '--legacy-peer-deps',
      '--offline',
      '--no-audit',
      '--no-fund',
      '--cache',
      resolve(directory, 'cache'),
      archive
    ],
    { cwd: directory }
  )

  const installedCore = resolve(directory, 'node_modules/@midstem/chronous')
  if (existsSync(installedCore)) {
    throw new Error(
      'Angular archive install unexpectedly installed @midstem/chronous'
    )
  }

  // Reuse the host's Angular peer framework while keeping Chronous on tarballs.
  symlinkSync(
    resolve(ROOT, 'node_modules/@angular'),
    resolve(directory, 'node_modules/@angular'),
    'junction'
  )
}

async function verifyMinimumConsumer(directory, angularPackage) {
  const consumer = resolve(directory, 'minimum')
  await buildMinimumConsumer(consumer, angularPackage)

  const server = createServer((request, response) => {
    const file = request.url === '/main.js' ? 'main.js' : 'index.html'
    response.setHeader(
      'Content-Type',
      file.endsWith('.js') ? 'text/javascript' : 'text/html'
    )
    response.end(readFileSync(resolve(consumer, file)))
  })
  const browser = await chromium.launch({ headless: true })

  try {
    await new Promise((resolveListening) =>
      server.listen(0, '127.0.0.1', resolveListening)
    )
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`http://127.0.0.1:${server.address().port}`)
    await expect(page.getByText('standup', { exact: true })).toBeVisible()

    await page.evaluate(() => window.chronousSmoke('events'))
    await expect(page.getByText('updated-event', { exact: true })).toBeVisible()
    await expect(page.getByText('standup', { exact: true })).toHaveCount(0)

    await page.evaluate(() => window.chronousSmoke('range'))
    await expect(page.getByText('updated-event', { exact: true })).toHaveCount(
      0
    )
    expect(errors).toEqual([])
    console.log(
      'Angular 18.0.0: README example renders and reactive events/range update from npm archives without JIT.'
    )
  } finally {
    await browser.close()
    await new Promise((resolveClosing) => server.close(resolveClosing))
  }
}

function quoteShellArgument(value) {
  if (process.platform === 'win32') {
    return `"${value.replaceAll('"', '""')}"`
  }
  return `'${value.replaceAll("'", "'\\''")}'`
}

function playwrightConfig(production) {
  const vite = resolve(ROOT, 'node_modules/vite/bin/vite.js')
  const appDirectory = resolve(ROOT, 'apps/playground-angular')
  const previewCommand = [
    process.execPath,
    vite,
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    '3198',
    '--strictPort',
    '--outDir',
    production
  ]
    .map(quoteShellArgument)
    .join(' ')

  return {
    testDir: resolve(ROOT, 'tools/e2e/tests'),
    outputDir: resolve(ROOT, 'tools/e2e/test-results/angular-package'),
    fullyParallel: true,
    workers: 4,
    retries: 0,
    timeout: 30000,
    expect: { timeout: 7000 },
    reporter: [['list']],
    use: {
      baseURL: 'http://127.0.0.1:3198',
      screenshot: 'only-on-failure',
      trace: 'retain-on-failure'
    },
    projects: [{ name: 'angular-package', use: { browserName: 'chromium' } }],
    webServer: {
      command: previewCommand,
      cwd: appDirectory,
      url: 'http://127.0.0.1:3198',
      reuseExistingServer: false
    }
  }
}

function buildProductionPlayground(directory, angularPackage) {
  const production = resolve(directory, 'production')
  runNpm(
    [
      'run',
      'build',
      '--workspace',
      '@midstem/chronous-playground-angular',
      '--',
      '--outDir',
      production,
      '--emptyOutDir'
    ],
    { env: { ...process.env, CHRONOUS_ANGULAR_PACKAGE: angularPackage } }
  )
  return production
}

function runPlaywright(directory, production) {
  const config = resolve(directory, 'playwright.config.mjs')
  writeFileSync(
    config,
    `export default ${JSON.stringify(playwrightConfig(production))}`
  )
  execFileSync(
    process.execPath,
    [
      resolve(ROOT, 'node_modules/@playwright/test/cli.js'),
      'test',
      '--config',
      config
    ],
    { cwd: ROOT, stdio: 'inherit' }
  )
}

async function verifyPackage() {
  const temporary = mkdtempSync(resolve(tmpdir(), 'chronous-angular-consumer-'))
  try {
    copyAngularLicense()
    const packages = packAngularPackage(temporary)
    const archive = angularArchive(temporary, packages)
    assertArchiveHasNoCoreDependency(archive)
    installAngularArchive(temporary, archive)

    const angularPackage = resolve(
      temporary,
      'node_modules/@midstem/chronous-angular'
    )
    await verifyMinimumConsumer(temporary, angularPackage)

    const production = buildProductionPlayground(temporary, angularPackage)
    runPlaywright(temporary, production)
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
}

await verifyPackage()
