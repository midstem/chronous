import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  classifyChangedPaths,
  isDocsOnlyPath,
  planEvent
} from './detect-changes.mjs'

describe('changed path classification', () => {
  it('skips code checks for documentation, image, and GitHub template changes', () => {
    // Given changes are limited to supported content paths
    const paths = [
      'README.md',
      'docs/installation.md',
      'packages/react/README.md',
      'apps/playground/README.md',
      'tools/release/README.md',
      'images/logo.svg',
      '.github/ISSUE_TEMPLATE/bug.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
      'CONTRIBUTING.md'
    ]

    // When the paths are classified, then both CI suites are skipped
    assert.deepEqual(classifyChangedPaths(paths), { code: false, pages: false })
  })

  it('runs full CI when core, adapters, tools, or root configuration changes', () => {
    // Given a code or configuration file is in the changed set
    for (const path of [
      'packages/core/src/index.ts',
      'packages/react/src/index.tsx',
      'packages/angular/src/index.ts',
      'packages/vue/src/index.ts',
      'packages/svelte/src/index.ts',
      'packages/core/src/deleted.ts',
      '.github/scripts/detect-changes.mjs',
      'package.json',
      'tsconfig.base.json'
    ]) {
      // When classified, then full code CI is required
      assert.deepEqual(classifyChangedPaths([path]), {
        code: true,
        pages: true
      })
    }
  })

  it('treats unrecognized paths and deletions conservatively as full CI', () => {
    // Given an unknown path (including a deleted file) appears in the diff
    assert.deepEqual(classifyChangedPaths(['scripts/custom.sh']), {
      code: true,
      pages: true
    })
    assert.deepEqual(classifyChangedPaths(['docs/old-guide.ts']), {
      code: true,
      pages: true
    })
  })

  it('writes full CI outputs for an all-zero base sentinel', async () => {
    // Given a new branch uses an all-zero base SHA
    const directory = await mkdtemp(join(tmpdir(), 'chronous-detect-'))
    const outputPath = join(directory, 'github-output')
    const script = resolve('.github/scripts/detect-changes.mjs')
    try {
      // When the CLI classifies that comparison, then it writes both outputs
      execFileSync(
        process.execPath,
        [script, '--base', '0000000000000000000000000000000000000000'],
        { env: { ...process.env, GITHUB_OUTPUT: outputPath } }
      )
      assert.equal(
        await readFile(outputPath, 'utf8'),
        'code=true\npages=true\n'
      )
    } finally {
      await rm(directory, { recursive: true })
    }
  })

  it('plans manual, PR, and push comparisons from explicit event variables', () => {
    const base = 'a'.repeat(40)
    const head = 'b'.repeat(40)
    assert.deepEqual(planEvent('workflow_dispatch'), { manual: true })
    assert.deepEqual(planEvent('pull_request', base, head), {
      manual: false,
      base,
      head,
      mergeBase: true
    })
    assert.deepEqual(planEvent('push', base, head), {
      manual: false,
      base,
      head,
      mergeBase: false
    })
    assert.throws(() => planEvent('schedule', base, head), /Unsupported EVENT/)
    assert.throws(() => planEvent('push', 'bad', head), /Invalid BASE SHA/)
  })

  it('handles workflow_dispatch without requiring Git refs', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'chronous-manual-'))
    const outputPath = join(directory, 'github-output')
    const script = resolve('.github/scripts/detect-changes.mjs')
    try {
      execFileSync(process.execPath, [script], {
        env: {
          ...process.env,
          EVENT: 'workflow_dispatch',
          BASE: '',
          HEAD: '',
          GITHUB_OUTPUT: outputPath
        }
      })
      assert.equal(
        await readFile(outputPath, 'utf8'),
        'code=true\npages=true\n'
      )
    } finally {
      await rm(directory, { recursive: true })
    }
  })

  it('uses merge-base for PRs and exact base/head for pushes', async () => {
    const repository = await mkdtemp(join(tmpdir(), 'chronous-diff-mode-'))
    const script = resolve('.github/scripts/detect-changes.mjs')
    const git = (args) =>
      execFileSync('git', args, { cwd: repository, encoding: 'utf8' }).trim()
    try {
      git(['init', '-q', '--initial-branch=main'])
      git(['config', 'user.email', 'test@example.invalid'])
      git(['config', 'user.name', 'Test'])
      await mkdir(join(repository, 'docs'), { recursive: true })
      await writeFile(join(repository, 'docs/base.md'), 'base\n')
      git(['add', '.'])
      git(['commit', '-qm', 'common base'])
      const common = git(['rev-parse', 'HEAD'])

      await mkdir(join(repository, 'packages/core/src'), { recursive: true })
      await writeFile(
        join(repository, 'packages/core/src/change.ts'),
        'export {}\n'
      )
      git(['add', '.'])
      git(['commit', '-qm', 'main code change'])
      const pushBase = git(['rev-parse', 'HEAD'])

      git(['checkout', '-qb', 'feature', common])
      await writeFile(join(repository, 'docs/feature.md'), 'feature docs\n')
      git(['add', '.'])
      git(['commit', '-qm', 'feature docs'])
      const head = git(['rev-parse', 'HEAD'])

      for (const [event, expected] of [
        ['push', 'code=true\npages=true\n'],
        ['pull_request', 'code=false\npages=false\n']
      ]) {
        const output = join(repository, `${event}-output`)
        execFileSync(process.execPath, [script], {
          cwd: repository,
          env: {
            ...process.env,
            EVENT: event,
            BASE: pushBase,
            HEAD: head,
            GITHUB_OUTPUT: output
          }
        })
        assert.equal(await readFile(output, 'utf8'), expected)
      }
    } finally {
      await rm(repository, { recursive: true, force: true })
    }
  })

  it('does not allow non-markdown paths in documentation directories', () => {
    assert.equal(isDocsOnlyPath('docs/diagram.png'), false)
    assert.equal(isDocsOnlyPath('packages/core/src/README.ts'), false)
  })
})
