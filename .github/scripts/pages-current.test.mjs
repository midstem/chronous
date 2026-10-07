import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidCommitSha, shouldDeploy } from './pages-current.mjs'

test('deploys only when the tested commit is current on main', () => {
  const sha = 'a'.repeat(40)
  assert.equal(shouldDeploy(sha, sha.toUpperCase()), true)
  assert.equal(shouldDeploy(sha, 'b'.repeat(40)), false)
})

test('rejects malformed commit IDs before comparing them', () => {
  assert.equal(isValidCommitSha('a'.repeat(40)), true)
  assert.equal(isValidCommitSha('a'.repeat(39)), false)
  assert.throws(() => shouldDeploy('not-a-sha', 'a'.repeat(40)), /40-character/)
})
