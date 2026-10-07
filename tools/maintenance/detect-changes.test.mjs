import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { classifyChangedPaths, isDocsOnlyPath } from './detect-changes.mjs'

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
      'tools/maintenance/detect-changes.mjs',
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
    const script = resolve('tools/maintenance/detect-changes.mjs')
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

  it('does not allow non-markdown paths in documentation directories', () => {
    assert.equal(isDocsOnlyPath('docs/diagram.png'), false)
    assert.equal(isDocsOnlyPath('packages/core/src/README.ts'), false)
  })
})
