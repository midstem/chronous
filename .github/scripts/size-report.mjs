import { appendFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  formatReport,
  measureRepository
} from '../../tools/maintenance/report-size.mjs'

const SHA_PATTERN = /^[0-9a-f]{40}$/i

export function isValidBaseSha(value) {
  return SHA_PATTERN.test(value ?? '')
}

export function baselineCommandPlan({ workspace, worktree, base }) {
  if (!isValidBaseSha(base))
    throw new Error('BASE must be a 40-character commit ID.')
  return [
    {
      command: 'git',
      args: ['worktree', 'add', '--detach', worktree, base],
      cwd: workspace
    },
    { command: 'npm', args: ['ci'], cwd: worktree },
    { command: 'npm', args: ['run', 'build'], cwd: worktree }
  ]
}

function runCommand(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

function readCurrentMeasurement(path) {
  const measurement = JSON.parse(readFileSync(path, 'utf8'))
  if (!measurement.metrics || typeof measurement.metrics !== 'object')
    throw new Error('Current size artifact has no metrics object.')
  return measurement
}

function writeSummary(summaryPath, content) {
  if (summaryPath) appendFileSync(summaryPath, content)
  else process.stdout.write(content)
}

export function formatSizeReport(current, baseline = undefined) {
  return baseline
    ? formatReport(current, baseline)
    : `Baseline measurement unavailable; reporting current sizes.\n\n${formatReport(current)}`
}

export async function runSizeReport(
  env = process.env,
  { run = runCommand, measure = measureRepository } = {}
) {
  const event = env.EVENT
  if (!['push', 'pull_request', 'workflow_dispatch'].includes(event))
    throw new Error(`Unsupported EVENT: ${event || '(missing)'}`)
  const runnerTemp = env.RUNNER_TEMP
  if (!runnerTemp) throw new Error('RUNNER_TEMP is required.')
  const current = readCurrentMeasurement(join(runnerTemp, 'current-size.json'))

  if (event !== 'pull_request') {
    writeSummary(env.GITHUB_STEP_SUMMARY, formatReport(current))
    return
  }

  let tempRoot
  let worktree
  let worktreeAdded = false
  let baseline
  try {
    if (!env.GITHUB_WORKSPACE)
      throw new Error('GITHUB_WORKSPACE is required for a PR baseline.')
    if (!isValidBaseSha(env.BASE))
      throw new Error('BASE is not a valid commit ID.')
    tempRoot = mkdtempSync(join(runnerTemp, 'chronous-size-baseline-'))
    worktree = join(tempRoot, 'checkout')
    const commands = baselineCommandPlan({
      workspace: env.GITHUB_WORKSPACE,
      worktree,
      base: env.BASE
    })
    for (const step of commands) {
      run(step.command, step.args, step.cwd)
      if (step.command === 'git') worktreeAdded = true
    }
    baseline = await measure(worktree)
  } catch (error) {
    process.stderr.write(`Baseline measurement unavailable: ${error.message}\n`)
    baseline = undefined
  } finally {
    if (worktreeAdded) {
      try {
        run(
          'git',
          ['worktree', 'remove', '--force', worktree],
          env.GITHUB_WORKSPACE
        )
      } catch {
        process.stderr.write(
          'Could not remove the temporary baseline worktree.\n'
        )
      }
    }
    if (tempRoot) rmSync(tempRoot, { recursive: true, force: true })
  }

  writeSummary(env.GITHUB_STEP_SUMMARY, formatSizeReport(current, baseline))
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  runSizeReport().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
