import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runPrecommit } from './precommit.mjs'

const temporaryRepositories = []

async function makeRepository() {
  const repository = await mkdtemp(join(tmpdir(), 'chronous-precommit-'))
  temporaryRepositories.push(repository)
  execFileSync('git', ['init', '-q'], { cwd: repository })
  execFileSync('git', ['config', 'user.email', 'test@example.invalid'], {
    cwd: repository
  })
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: repository })
  return repository
}

function capture() {
  let value = ''
  return { stream: { write: (text) => (value += text) }, value: () => value }
}

after(async () => {
  await Promise.all(
    temporaryRepositories.splice(0).map((path) => rm(path, { recursive: true }))
  )
})

describe('staged pre-commit checks', () => {
  it('is a no-op when there are no staged files', async () => {
    // Given a clean index
    const repository = await makeRepository()
    const stdout = capture()

    // When pre-commit checks run, then they report the no-op
    assert.equal(await runPrecommit(repository, { stdout: stdout.stream }), 0)
    assert.match(stdout.value(), /No staged files/)
  })

  it('checks staged bytes even when the worktree has different bytes', async () => {
    // Given the index has unformatted Markdown and the worktree is fixed
    const repository = await makeRepository()
    const path = join(repository, 'guide.json')
    await writeFile(path, '{"a":1}')
    execFileSync('git', ['add', 'guide.json'], { cwd: repository })
    await writeFile(path, '{\n  "a": 1\n}\n')
    const stderr = capture()

    // When checks run, then they report the staged content and ask to re-stage
    assert.equal(await runPrecommit(repository, { stderr: stderr.stream }), 1)
    assert.match(stderr.value(), /guide\.json: Prettier formatting differs/)
    assert.match(stderr.value(), /stage it again/)
  })

  it('infers YAML formatting for staged filenames containing spaces', async () => {
    // Given a staged YAML file with spaces in its name and nonstandard spacing
    const repository = await makeRepository()
    const name = 'file with spaces.yaml'
    await writeFile(join(repository, name), 'field:    value\n')
    execFileSync('git', ['add', name], { cwd: repository })
    const stderr = capture()

    // When checks run, then the path and inferred parser are handled safely
    assert.equal(await runPrecommit(repository, { stderr: stderr.stream }), 1)
    assert.match(
      stderr.value(),
      /file with spaces\.yaml: Prettier formatting differs/
    )
  })

  it('skips deleted paths and checks only remaining staged files', async () => {
    // Given a staged deletion and a well-formatted staged Markdown file
    const repository = await makeRepository()
    await writeFile(join(repository, 'deleted.md'), '# old\n')
    await writeFile(join(repository, 'ok.md'), '# Good\n')
    execFileSync('git', ['add', '.'], { cwd: repository })
    execFileSync('git', ['commit', '-qm', 'seed'], { cwd: repository })
    execFileSync('git', ['rm', '-q', 'deleted.md'], { cwd: repository })
    await writeFile(join(repository, 'ok.md'), '# Better\n')
    execFileSync('git', ['add', 'ok.md'], { cwd: repository })
    const stdout = capture()

    // When checks run, then only the staged addition/change is counted
    assert.equal(await runPrecommit(repository, { stdout: stdout.stream }), 0)
    assert.match(stdout.value(), /checked 1 staged file\(s\)/)
  })
})
