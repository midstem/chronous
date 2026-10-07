import assert from 'node:assert/strict'
import test from 'node:test'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  baselineCommandPlan,
  formatSizeReport,
  isValidBaseSha,
  runSizeReport
} from './size-report.mjs'

const manifest = { metrics: { core: { bytes: 12, gzipBytes: 8 } } }

test('renders current metrics and labels an unavailable advisory baseline', () => {
  const report = formatSizeReport(manifest)
  assert.match(report, /Baseline measurement unavailable/)
  assert.match(report, /core \| 8 B gzip \(12 B minified\)/)
})

test('reports push sizes without fetching or creating a baseline worktree', async () => {
  const runnerTemp = mkdtempSync(join(tmpdir(), 'chronous-size-current-'))
  const summary = join(runnerTemp, 'summary.md')
  writeFileSync(join(runnerTemp, 'current-size.json'), JSON.stringify(manifest))
  try {
    await runSizeReport(
      {
        EVENT: 'push',
        RUNNER_TEMP: runnerTemp,
        GITHUB_STEP_SUMMARY: summary
      },
      {
        run() {
          assert.fail('current-only reporting must not run commands')
        },
        measure: async () =>
          assert.fail('current-only reporting does not measure a baseline')
      }
    )
    const report = readFileSync(summary, 'utf8')
    assert.match(report, /core \| 8 B gzip/)
    assert.doesNotMatch(report, /Baseline measurement unavailable/)
  } finally {
    rmSync(runnerTemp, { recursive: true, force: true })
  }
})

test('plans baseline work in an isolated checkout with validated commit IDs', () => {
  const base = 'a'.repeat(40)
  assert.equal(isValidBaseSha(base), true)
  assert.deepEqual(
    baselineCommandPlan({
      workspace: '/workspace/project',
      worktree: '/tmp/chronous-baseline/checkout',
      base
    }),
    [
      {
        command: 'git',
        args: [
          'worktree',
          'add',
          '--detach',
          '/tmp/chronous-baseline/checkout',
          base
        ],
        cwd: '/workspace/project'
      },
      { command: 'npm', args: ['ci'], cwd: '/tmp/chronous-baseline/checkout' },
      {
        command: 'npm',
        args: ['run', 'build'],
        cwd: '/tmp/chronous-baseline/checkout'
      }
    ]
  )
  assert.throws(
    () =>
      baselineCommandPlan({
        workspace: '/workspace',
        worktree: '/tmp/wt',
        base: '--help'
      }),
    /40-character commit ID/
  )
})

test('runs a successful PR baseline in a temporary worktree and removes it', async () => {
  const runnerTemp = mkdtempSync(join(tmpdir(), 'chronous-size-test-'))
  const summary = join(runnerTemp, 'summary.md')
  const calls = []
  const baseline = { metrics: { core: { bytes: 10, gzipBytes: 5 } } }
  writeFileSync(join(runnerTemp, 'current-size.json'), JSON.stringify(manifest))
  try {
    await runSizeReport(
      {
        EVENT: 'pull_request',
        BASE: 'a'.repeat(40),
        RUNNER_TEMP: runnerTemp,
        GITHUB_WORKSPACE: '/workspace/project',
        GITHUB_STEP_SUMMARY: summary
      },
      {
        run(command, args, cwd) {
          calls.push({ command, args, cwd })
        },
        measure: async () => baseline
      }
    )
    assert.deepEqual(
      calls.map(({ command }) => command),
      ['git', 'npm', 'npm', 'git']
    )
    assert.deepEqual(calls[0].args.slice(0, 3), ['worktree', 'add', '--detach'])
    assert.equal(calls[0].args[4], 'a'.repeat(40))
    assert.deepEqual(calls[1].args, ['ci'])
    assert.deepEqual(calls[2].args, ['run', 'build'])
    assert.deepEqual(calls[3].args, [
      'worktree',
      'remove',
      '--force',
      calls[0].args[3]
    ])
    assert.equal(calls[0].cwd, '/workspace/project')
    assert.equal(calls[1].cwd, calls[0].args[3])
    assert.equal(calls[2].cwd, calls[0].args[3])
    assert.equal(calls[3].cwd, '/workspace/project')
    assert.notEqual(calls[1].cwd, '/workspace/project')
    assert.match(readFileSync(summary, 'utf8'), /\+3 B gzip/)
    assert.equal(existsSync(calls[0].args[3]), false)
  } finally {
    rmSync(runnerTemp, { recursive: true, force: true })
  }
})

test('removes the temporary worktree and reports current sizes when base build fails', async () => {
  const runnerTemp = mkdtempSync(join(tmpdir(), 'chronous-size-failure-'))
  const summary = join(runnerTemp, 'summary.md')
  const calls = []
  writeFileSync(join(runnerTemp, 'current-size.json'), JSON.stringify(manifest))
  try {
    await runSizeReport(
      {
        EVENT: 'pull_request',
        BASE: 'b'.repeat(40),
        RUNNER_TEMP: runnerTemp,
        GITHUB_WORKSPACE: '/workspace/project',
        GITHUB_STEP_SUMMARY: summary
      },
      {
        run(command, args, cwd) {
          calls.push({ command, args, cwd })
          if (command === 'npm' && args.includes('build'))
            throw new Error('base build failed')
        },
        measure: async () => {
          throw new Error('measurement should not run after failed build')
        }
      }
    )
    assert.deepEqual(calls.at(-1).args.slice(0, 3), [
      'worktree',
      'remove',
      '--force'
    ])
    assert.match(
      readFileSync(summary, 'utf8'),
      /Baseline measurement unavailable/
    )
    assert.match(readFileSync(summary, 'utf8'), /core \| 8 B gzip/)
  } finally {
    rmSync(runnerTemp, { recursive: true, force: true })
  }
})

test('removes the temporary worktree and reports current sizes when measurement fails', async () => {
  const runnerTemp = mkdtempSync(
    join(tmpdir(), 'chronous-size-measure-failure-')
  )
  const summary = join(runnerTemp, 'summary.md')
  const calls = []
  writeFileSync(join(runnerTemp, 'current-size.json'), JSON.stringify(manifest))
  try {
    await runSizeReport(
      {
        EVENT: 'pull_request',
        BASE: 'c'.repeat(40),
        RUNNER_TEMP: runnerTemp,
        GITHUB_WORKSPACE: '/workspace/project',
        GITHUB_STEP_SUMMARY: summary
      },
      {
        run(command, args, cwd) {
          calls.push({ command, args, cwd })
        },
        measure: async () => {
          throw new Error('base measurement failed')
        }
      }
    )
    assert.deepEqual(calls.at(-1).args.slice(0, 3), [
      'worktree',
      'remove',
      '--force'
    ])
    assert.match(
      readFileSync(summary, 'utf8'),
      /Baseline measurement unavailable/
    )
    assert.match(readFileSync(summary, 'utf8'), /core \| 8 B gzip/)
  } finally {
    rmSync(runnerTemp, { recursive: true, force: true })
  }
})
