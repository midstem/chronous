import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

const OUTPUT = resolve(ROOT, 'dist-pages')

const PLAYGROUNDS = [
  { id: 'react', title: 'React', packageName: '@midstem/chronous-react' },
  { id: 'angular', title: 'Angular', packageName: '@midstem/chronous-angular' },
  { id: 'vue', title: 'Vue', packageName: '@midstem/chronous-vue' }
]

const run = (workspace) =>
  execFileSync('npm', ['run', 'build', '--workspace', workspace], {
    cwd: ROOT,
    stdio: 'inherit'
  })

const buildPackages = () =>
  execFileSync('npm', ['run', 'build'], {
    cwd: ROOT,
    stdio: 'inherit'
  })

const buildPlayground = ({ id }) => {
  run(`@midstem/chronous-playground-${id}`)

  cpSync(
    resolve(ROOT, 'apps', `playground-${id}`, 'dist'),
    resolve(OUTPUT, id),
    {
      recursive: true
    }
  )
}

const toCard = ({ id, title, packageName }) => `
      <a class="card" href="./${id}/">
        <span class="card__title">${title}</span>
        <code class="card__package">${packageName}</code>
      </a>`

const buildIndex = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>Chronous playgrounds</title>
    <style>
      :root {
        color-scheme: light dark;
        --color-canvas: #f4f4f5;
        --color-surface: #ffffff;
        --color-line: #e4e4e7;
        --color-ink: #18181b;
        --color-muted: #71717a;
        --color-accent: #1d4ed8;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-canvas: #09090b;
          --color-surface: #18181b;
          --color-line: #3f3f46;
          --color-ink: #f4f4f5;
          --color-muted: #a1a1aa;
          --color-accent: #93c5fd;
        }
      }

      body {
        margin: 0;
        padding: 48px 20px;
        background: var(--color-canvas);
        color: var(--color-ink);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      main {
        max-width: 720px;
        margin: 0 auto;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: -0.02em;
      }

      p {
        margin: 0 0 32px;
        color: var(--color-muted);
        font-size: 15px;
        line-height: 1.5;
      }

      .cards {
        display: grid;
        gap: 12px;
      }

      .card {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        color: inherit;
        text-decoration: none;
        background: var(--color-surface);
        border: 1px solid var(--color-line);
        border-radius: 10px;
        transition: border-color 0.15s ease;
      }

      .card:hover {
        border-color: var(--color-accent);
      }

      .card__title {
        font-size: 16px;
        font-weight: 600;
      }

      .card__package {
        color: var(--color-muted);
        font-size: 13px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Chronous playgrounds</h1>
      <p>
        The same playground built against every adapter — explore each framework integration.
      </p>
      <div class="cards">${PLAYGROUNDS.map(toCard).join('')}
      </div>
    </main>
  </body>
</html>
`

rmSync(OUTPUT, { recursive: true, force: true })
mkdirSync(OUTPUT, { recursive: true })

buildPackages()
PLAYGROUNDS.forEach(buildPlayground)

writeFileSync(resolve(OUTPUT, 'index.html'), buildIndex())
writeFileSync(resolve(OUTPUT, '.nojekyll'), '')

console.error(`built ${PLAYGROUNDS.length} playgrounds into dist-pages`)
