import assert from 'node:assert/strict'
import test from 'node:test'
import { planVerification } from './verify-package.mjs'

test('plans current and minimum matrix tarball checks', () => {
  assert.deepEqual(planVerification('core', 'current'), [
    {
      command: 'npm',
      args: ['run', 'verify:package', '--', '--package', 'core']
    }
  ])
  assert.deepEqual(planVerification('svelte', 'minimum'), [
    {
      command: 'npm',
      args: ['run', 'verify:package', '--', '--package', 'svelte', '--minimum']
    }
  ])
})

test('plans release verification for package names and runs Angular once', () => {
  assert.deepEqual(planVerification('@midstem/chronous-react', 'release'), [
    {
      command: 'npm',
      args: ['run', 'verify:package', '--', '--package', 'react']
    },
    {
      command: 'npm',
      args: ['run', 'verify:package', '--', '--package', 'react', '--minimum']
    }
  ])
  assert.deepEqual(planVerification('@midstem/chronous', 'release'), [
    {
      command: 'npm',
      args: ['run', 'verify:package', '--', '--package', 'core']
    }
  ])
  assert.deepEqual(planVerification('@midstem/chronous-angular', 'release'), [
    {
      command: 'node',
      args: ['tools/angular-build/scripts/verify-package.mjs']
    }
  ])
})

test('rejects unknown selectors and incompatible runtimes', () => {
  assert.throws(() => planVerification('unknown', 'current'), /Unknown package/)
  assert.throws(() => planVerification('react', 'release'), /Matrix runtime/)
  assert.throws(
    () => planVerification('@midstem/chronous-vue', 'current'),
    /release runtime/
  )
})
