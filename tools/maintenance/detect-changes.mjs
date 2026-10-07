import { appendFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const ZERO_SHA = /^0+$/

/** Classify changed paths. Unknown paths always require the full CI suite. */
export function classifyChangedPaths(paths) {
  if (paths.length === 0) return { code: false, pages: false }
  const docsOnly = paths.every(isDocsOnlyPath)
  return { code: !docsOnly, pages: !docsOnly }
}

export function isDocsOnlyPath(path) {
  if (path.startsWith('images/')) return true
  if (path.startsWith('.github/ISSUE_TEMPLATE/')) return true
  if (path === '.github/PULL_REQUEST_TEMPLATE.md') return true
  if (path === '.github/CODEOWNERS') return true
  if (/^(SECURITY|CONTRIBUTING|CODE_OF_CONDUCT|CODEOWNERS)\.md$/i.test(path))
    return true

  if (!path.endsWith('.md')) return false
  if (!path.includes('/')) return true
  return /^(docs|packages|apps|tools)\/.+\.md$/.test(path)
}

function git(args) {
  return execFileSync('git', args, { encoding: 'buffer' })
}

function changedPaths(base, head, useMergeBase) {
  if (ZERO_SHA.test(base)) return ['<all>']
  const comparisonBase = useMergeBase
    ? git(['merge-base', base, head]).toString('utf8').trim()
    : base
  const result = git(['diff', '--name-only', '-z', comparisonBase, head])
  return result.toString('utf8').split('\0').filter(Boolean)
}

function parseArgs(args) {
  const options = { base: undefined, head: 'HEAD', mergeBase: false }
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--base') options.base = args[++i]
    else if (args[i] === '--head') options.head = args[++i]
    else if (args[i] === '--merge-base') options.mergeBase = true
    else throw new Error(`Unknown argument: ${args[i]}`)
  }
  if (!options.base)
    throw new Error(
      'Usage: detect-changes.mjs --base SHA [--head SHA] [--merge-base]'
    )
  return options
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    const classification = classifyChangedPaths(
      changedPaths(options.base, options.head, options.mergeBase)
    )
    const output = `code=${classification.code}\npages=${classification.pages}\n`
    if (process.env.GITHUB_OUTPUT)
      appendFileSync(process.env.GITHUB_OUTPUT, output)
    else process.stdout.write(output)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
)
  main()
