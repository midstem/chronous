import { appendFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

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

const isSha = (value) => /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(value ?? '')

export function planEvent(event, base, head) {
  if (event === 'workflow_dispatch') return { manual: true }
  if (event !== 'push' && event !== 'pull_request')
    throw new Error(`Unsupported EVENT: ${event || '(missing)'}`)
  if (!isSha(base)) throw new Error(`Invalid BASE SHA for ${event}`)
  if (!isSha(head)) throw new Error(`Invalid HEAD SHA for ${event}`)
  return { manual: false, base, head, mergeBase: event === 'pull_request' }
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

function writeOutput(classification) {
  const output = `code=${classification.code}\npages=${classification.pages}\n`
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, output)
  else process.stdout.write(output)
}

function main() {
  try {
    const args = process.argv.slice(2)
    if (args.length === 0) {
      const plan = planEvent(
        process.env.EVENT,
        process.env.BASE,
        process.env.HEAD
      )
      if (plan.manual) {
        writeOutput({ code: true, pages: true })
        return
      }
      writeOutput(
        classifyChangedPaths(changedPaths(plan.base, plan.head, plan.mergeBase))
      )
      return
    }

    const options = parseArgs(args)
    writeOutput(
      classifyChangedPaths(
        changedPaths(options.base, options.head, options.mergeBase)
      )
    )
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main()
