import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateChecks } from './ci-checks.mjs'

const base = (code) => ({
  changes: { result: 'success', outputs: { code } },
  format: { result: 'success' },
  quality: { result: 'skipped' },
  e2e: { result: 'skipped' },
  packages: { result: 'skipped' },
  'angular-package': { result: 'skipped' }
})

test('accepts documentation-only changes when expensive jobs are skipped', () => {
  assert.deepEqual(evaluateChecks(base('false')), {
    ok: true,
    message: 'All applicable CI checks passed.'
  })
})

test('requires every code job when code changes', () => {
  const jobs = base('true')
  for (const name of ['quality', 'e2e', 'packages', 'angular-package'])
    jobs[name] = { result: 'success' }
  assert.equal(evaluateChecks(jobs).ok, true)
  delete jobs.packages
  assert.match(evaluateChecks(jobs).message, /packages is missing a result/)
})

test('fails on failed or cancelled always-required jobs and malformed code results', () => {
  const changesFailed = base('false')
  changesFailed.changes.result = 'failure'
  assert.match(evaluateChecks(changesFailed).message, /changes=failure/)

  const formatCancelled = base('false')
  formatCancelled.format.result = 'cancelled'
  assert.match(evaluateChecks(formatCancelled).message, /format=cancelled/)
  assert.match(evaluateChecks(base('TRUE')).message, /valid code output/)
  assert.match(evaluateChecks({}).message, /valid code output/)

  const unrelatedCancelled = base('false')
  unrelatedCancelled.e2e.result = 'cancelled'
  assert.match(evaluateChecks(unrelatedCancelled).message, /e2e=cancelled/)
})
