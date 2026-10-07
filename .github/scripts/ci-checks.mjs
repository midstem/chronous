import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ALWAYS_REQUIRED = ['changes', 'format']
const CODE_REQUIRED = ['quality', 'e2e', 'packages', 'angular-package']

export function evaluateChecks(results) {
  if (!results || typeof results !== 'object' || Array.isArray(results))
    return {
      ok: false,
      message: 'RESULTS must be a JSON object of job results.'
    }

  const changes = results.changes
  const code = changes?.outputs?.code
  if (code !== 'true' && code !== 'false')
    return {
      ok: false,
      message: 'The required changes job is missing a valid code output.'
    }

  const required =
    code === 'true' ? [...ALWAYS_REQUIRED, ...CODE_REQUIRED] : ALWAYS_REQUIRED
  const failures = []
  for (const name of required) {
    const job = results[name]
    if (!job || typeof job.result !== 'string') {
      failures.push(`${name} is missing a result`)
    } else if (job.result !== 'success') {
      failures.push(`${name}=${job.result}`)
    }
  }

  if (code === 'false') {
    for (const name of CODE_REQUIRED) {
      const status = results[name]?.result
      if (status && status !== 'success' && status !== 'skipped')
        failures.push(`${name}=${status}`)
    }
  }

  return failures.length
    ? {
        ok: false,
        message: `Required CI checks did not pass: ${failures.join(', ')}`
      }
    : { ok: true, message: 'All applicable CI checks passed.' }
}

function main() {
  try {
    if (!process.env.RESULTS)
      throw new Error('RESULTS environment variable is required.')
    const result = evaluateChecks(JSON.parse(process.env.RESULTS))
    if (!result.ok) throw new Error(result.message)
    process.stdout.write(`${result.message}\n`)
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
