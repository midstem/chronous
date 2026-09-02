import { execFileSync } from 'node:child_process'
import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const LICENSE_FILE_NAME = 'LICENSE'

const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const run = (...args) =>
  execFileSync(NPM_COMMAND, args, {
    cwd: REPOSITORY_ROOT,
    stdio: 'inherit'
  })

run('run', 'build')
run('run', 'verify:dist')

copyFileSync(
  resolve(REPOSITORY_ROOT, LICENSE_FILE_NAME),
  resolve(LICENSE_FILE_NAME)
)
