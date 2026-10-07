import { appendFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const SHA_PATTERN = /^[0-9a-f]{40}$/i

export function shouldDeploy(currentSha, mainSha) {
  if (!SHA_PATTERN.test(currentSha ?? '') || !SHA_PATTERN.test(mainSha ?? ''))
    throw new Error(
      'GITHUB_SHA and fetched main SHA must be 40-character commit IDs.'
    )
  return currentSha.toLowerCase() === mainSha.toLowerCase()
}

export function isValidCommitSha(value) {
  return SHA_PATTERN.test(value ?? '')
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

export function runPagesCurrent(env = process.env, cwd = process.cwd()) {
  const currentSha = env.GITHUB_SHA
  if (!isValidCommitSha(currentSha))
    throw new Error('GITHUB_SHA must be a 40-character commit ID.')
  execFileSync('git', ['fetch', 'origin', 'main'], { cwd, stdio: 'inherit' })
  const mainSha = git(['rev-parse', 'FETCH_HEAD'], cwd)
  const deploy = shouldDeploy(currentSha, mainSha)
  const output = `deploy=${deploy}\n`
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, output)
  else process.stdout.write(output)
  if (!deploy)
    process.stdout.write(
      'A newer commit is on main; skipping this deployment.\n'
    )
  return deploy
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    runPagesCurrent()
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}
