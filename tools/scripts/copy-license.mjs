import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)

const LICENSE_FILE_NAME = 'LICENSE'

copyFileSync(
  resolve(REPOSITORY_ROOT, LICENSE_FILE_NAME),
  resolve(LICENSE_FILE_NAME)
)
