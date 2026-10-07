import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const matrixPackages = new Set(['core', 'react', 'vue', 'svelte'])
const releasePackages = new Set([
  '@midstem/chronous',
  '@midstem/chronous-react',
  '@midstem/chronous-vue',
  '@midstem/chronous-svelte',
  '@midstem/chronous-angular'
])

function tarballCheck(packageName, minimum) {
  const args = ['run', 'verify:package', '--', '--package', packageName]
  if (minimum) args.push('--minimum')
  return { command: 'npm', args }
}

export function planVerification(packageName, runtime) {
  if (matrixPackages.has(packageName)) {
    if (runtime !== 'current' && runtime !== 'minimum')
      throw new Error('Matrix runtime must be current or minimum.')
    return [tarballCheck(packageName, runtime === 'minimum')]
  }

  if (!releasePackages.has(packageName))
    throw new Error(`Unknown package selector: ${packageName}`)
  if (runtime !== 'release')
    throw new Error('Published package names require the release runtime.')

  if (packageName === '@midstem/chronous-angular')
    return [
      {
        command: 'node',
        args: ['tools/angular-build/scripts/verify-package.mjs']
      }
    ]

  const shortName =
    packageName === '@midstem/chronous'
      ? 'core'
      : packageName.replace('@midstem/chronous-', '')
  const commands = [tarballCheck(shortName, false)]
  if (shortName !== 'core') commands.push(tarballCheck(shortName, true))
  return commands
}

export function runVerification(packageName, runtime) {
  const commands = planVerification(packageName, runtime)
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  for (const step of commands) {
    const command = step.command === 'npm' ? npm : step.command
    execFileSync(command, step.args, { cwd: root, stdio: 'inherit' })
  }
}

function main(args) {
  if (args.length !== 2)
    throw new Error('Usage: verify-package.mjs PACKAGE RUNTIME')
  runVerification(args[0], args[1])
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}
