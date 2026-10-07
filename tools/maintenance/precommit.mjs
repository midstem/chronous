import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const scriptRoot = root
const require = createRequire(resolve(root, 'package.json'))
const prettier = require('prettier')

function git(repositoryRoot, args, options = {}) {
  return execFileSync('git', args, { cwd: repositoryRoot, ...options })
}

function stagedPaths(repositoryRoot) {
  return git(repositoryRoot, [
    'diff',
    '--cached',
    '--name-only',
    '-z',
    '--diff-filter=ACMR'
  ])
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
}

function stagedContents(repositoryRoot, path) {
  return git(repositoryRoot, ['show', `:${path}`], { encoding: 'utf8' })
}

async function checkFormatting(path, contents, repositoryRoot) {
  const absolutePath = resolve(repositoryRoot, path)
  const fileInfo = await prettier.getFileInfo(absolutePath, {
    ignorePath: resolve(repositoryRoot, '.prettierignore'),
    withNodeModules: false
  })
  if (fileInfo.ignored || !fileInfo.inferredParser) return null

  const config = await prettier.resolveConfig(absolutePath)
  const formatted = await prettier.format(contents, {
    ...config,
    filepath: absolutePath
  })
  return formatted === contents ? null : 'format'
}

function checkLint(path, contents, repositoryRoot) {
  if (!/\.(?:[cm]?js|tsx?)$/i.test(path)) return null
  try {
    execFileSync(
      resolve(scriptRoot, 'node_modules/.bin/eslint'),
      ['--stdin', '--stdin-filename', path],
      {
        cwd: repositoryRoot,
        input: contents,
        stdio: ['pipe', 'pipe', 'pipe']
      }
    )
    return null
  } catch (error) {
    return (
      error.stderr?.toString('utf8') ||
      error.stdout?.toString('utf8') ||
      'ESLint failed'
    )
  }
}

export async function runPrecommit(
  repositoryRoot = root,
  { stdout = process.stdout, stderr = process.stderr } = {}
) {
  const paths = stagedPaths(repositoryRoot)
  if (paths.length === 0) {
    stdout.write('No staged files; pre-commit checks skipped.\n')
    return 0
  }

  const failures = []
  for (const path of paths) {
    const contents = stagedContents(repositoryRoot, path)
    const formatFailure = await checkFormatting(path, contents, repositoryRoot)
    if (formatFailure)
      failures.push({ path, message: 'Prettier formatting differs' })
    const lintFailure = checkLint(path, contents, repositoryRoot)
    if (lintFailure) failures.push({ path, message: lintFailure.trim() })
  }

  if (failures.length) {
    for (const failure of failures)
      stderr.write(`${failure.path}: ${failure.message}\n`)
    stderr.write('Fix the staged content, then stage it again.\n')
    return 1
  }

  stdout.write(
    `Pre-commit checked ${paths.length} staged file(s). Full checks run in CI.\n`
  )
  return 0
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  runPrecommit(process.argv[2] === '--root' ? resolve(process.argv[3]) : root)
    .then((code) => {
      process.exitCode = code
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`)
      process.exitCode = 1
    })
