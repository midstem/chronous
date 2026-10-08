import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FRAMEWORK_LOGOS } from '../../packages/playground-core/src/frameworks/constants.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

const OUTPUT = resolve(ROOT, 'dist-pages')

const PLAYGROUNDS = [
  { id: 'react', title: 'React', packageName: '@midstem/chronous-react' },
  { id: 'angular', title: 'Angular', packageName: '@midstem/chronous-angular' },
  { id: 'vue', title: 'Vue', packageName: '@midstem/chronous-vue' },
  { id: 'svelte', title: 'Svelte', packageName: '@midstem/chronous-svelte' },
  { id: 'vanilla', title: 'Vanilla JS', packageName: '@midstem/chronous' },
  {
    id: 'shadcn',
    title: 'shadcn/ui',
    packageName: '@chronous/chronous-calendar'
  }
]

const EXTRA_LOGOS = {
  shadcn: {
    viewBox: '0 0 256 256',
    svg: '<g fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round"><path d="M208 128 128 208"/><path d="M192 40 40 192"/></g>'
  }
}

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

const logoOf = (id) => {
  const { viewBox, svg } = FRAMEWORK_LOGOS[id] ?? EXTRA_LOGOS[id]
  const [x, y, width, height] = viewBox.split(' ').map(Number)
  const paddedViewBox = `${x - 3} ${y - 3} ${width + 6} ${height + 6}`

  return `<svg viewBox="${paddedViewBox}" width="32" height="32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`
}

const toCard = ({ id, title, packageName }, index) => `
      <a class="card card--${id}" href="./${id}/">
        <div class="card__top">
          <span class="card__mark" aria-hidden="true">${logoOf(id)}</span>
          <span class="card__number" aria-hidden="true">0${index + 1}</span>
        </div>
        <h2>${title}</h2>
        <code class="card__package">${packageName}</code>
        <span class="card__action">Open playground <span aria-hidden="true">↗</span></span>
      </a>`

const buildIndex = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="description" content="Explore Chronous in vanilla JavaScript, React, Angular, Vue, Svelte and shadcn/ui. Try calendar views, event examples and live options with generated code." />
    <title>Chronous playgrounds</title>
    <style>
      :root {
        color-scheme: light dark;
        --canvas: light-dark(#f8fafc, #020617);
        --surface: light-dark(#ffffff, #0b1225);
        --line: light-dark(#e2e8f0, #ffffff26);
        --ink: light-dark(#0f172a, #e2e8f0);
        --muted: light-dark(#64748b, #94a3b8);
        --accent: light-dark(#7c3aed, #a78bfa);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0 24px;
        background: var(--canvas);
        color: var(--ink);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      main { max-width: 1000px; margin: 0 auto; }
      .masthead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 28px 0;
        border-bottom: 1px solid var(--line);
      }
      .brand { font-size: 18px; font-weight: 700; letter-spacing: -0.04em; }
      .brand span { color: var(--accent); }
      .docs { color: var(--muted); font-size: 13px; text-decoration: none; }
      .docs:hover { color: var(--ink); }
      .intro { max-width: 740px; padding: 64px 0 36px; }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 20px;
        color: var(--accent);
        font-size: 12px;
        font-weight: 600;
      }
      .eyebrow::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      h1 { margin: 0 0 18px; max-width: 680px; font-size: clamp(32px, 5vw, 52px); line-height: 1.12; font-weight: 650; letter-spacing: -0.045em; }
      .intro p { margin: 0; max-width: 580px; color: var(--muted); font-size: 16px; line-height: 1.7; }
      .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .card {
        --tint: light-dark(#1d4ed8, #93c5fd);
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: 24px;
        color: inherit;
        text-decoration: none;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 12px;
        transition: border-color 150ms ease, transform 150ms ease;
      }
      .card--angular { --tint: light-dark(#be123c, #fda4af); }
      .card--vue { --tint: light-dark(#047857, #6ee7b7); }
      .card--svelte { --tint: light-dark(#c2410c, #fdba74); }
      .card--vanilla { --tint: light-dark(#ca8a04, #facc15); }
      .card--shadcn { --tint: light-dark(#0f172a, #e2e8f0); }
      .card:hover { border-color: var(--tint); transform: translateY(-2px); }
      a:focus-visible { outline: 2px solid var(--accent); outline-offset: 5px; border-radius: 12px; }
      .card__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
      .card__mark { display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid var(--line); border-radius: 10px; }
      .card__mark svg { display: block; }
      .card__number { color: var(--muted); font: 11px ui-monospace, monospace; }
      h2 { margin: 0 0 8px; font-size: 21px; font-weight: 600; letter-spacing: -0.025em; }
      .card__package { color: var(--muted); font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
      .card__action { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--tint); font-size: 13px; font-weight: 600; }
      footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 28px 0 40px; color: var(--muted); font-size: 12px; line-height: 1.6; }
      @media (max-width: 560px) {
        body { padding: 0 18px; }
        .intro { padding-top: 40px; }
        .cards { grid-template-columns: 1fr; }
        .card { padding: 20px; }
      }
      @media (prefers-reduced-motion: reduce) { .card { transition: none; } .card:hover { transform: none; } }
    </style>
  </head>
  <body>
    <main>
      <header class="masthead">
        <div class="brand">Chronous<span>.</span></div>
        <a class="docs" href="https://github.com/midstem/chronous#readme">Documentation ↗</a>
      </header>
      <section class="intro" aria-labelledby="title">
        <div class="eyebrow">Interactive playgrounds</div>
        <h1 id="title">Your framework.<br />Your calendar.</h1>
        <p>Explore the same Chronous calendar in vanilla JavaScript, four frameworks and the shadcn/ui registry. Try event examples, adjust calendar options, and see the code behind every view.</p>
      </section>
      <nav class="cards" aria-label="Choose a framework">${PLAYGROUNDS.map(toCard).join('')}
      </nav>
      <footer>
        <span>One scheduling engine. Four framework integrations, vanilla JavaScript and a shadcn/ui component.</span>
        <span>Day · Week · Month · Agenda</span>
      </footer>
    </main>
  </body>
</html>

`

const arguments_ = process.argv.slice(2)
if (arguments_.some((argument) => argument !== '--skip-package-build')) {
  throw new Error('Usage: build-pages.mjs [--skip-package-build]')
}

rmSync(OUTPUT, { recursive: true, force: true })
mkdirSync(OUTPUT, { recursive: true })

if (!arguments_.includes('--skip-package-build')) buildPackages()
PLAYGROUNDS.forEach(buildPlayground)

writeFileSync(resolve(OUTPUT, 'index.html'), buildIndex())
writeFileSync(resolve(OUTPUT, '.nojekyll'), '')
execFileSync(
  'npx',
  ['shadcn@4.21.4', 'build', '--output', resolve(OUTPUT, 'r')],
  {
    cwd: ROOT,
    stdio: 'inherit'
  }
)

console.error(`built ${PLAYGROUNDS.length} playgrounds into dist-pages`)
