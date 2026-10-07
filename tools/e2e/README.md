# E2E tests

The same 28 scenarios run on React, Angular, Vue, Svelte and Vanilla JS.
Selectors and actions live in [PlaygroundPage](pages/playground.ts), following
[Playwright POM](https://playwright.dev/docs/pom). Specs use the `playground` fixture.

```bash
npm ci
npm run build
npm run test:e2e
PLAYGROUND=react npm run test:e2e -- --project=react
BROWSER=firefox npm run test:e2e
BROWSER=webkit npm run test:e2e
npm run test:e2e -- --ui
```

Install the Playwright browser you plan to use with
`npx playwright install chromium` (or `firefox` or `webkit`). Build the
packages before running the playground tests; the apps import their built
outputs. The optional `PLAYGROUND` variable selects a framework when useful,
and Playwright flags after `--` are passed through to the runner.

CI builds the packages once and shares that artifact with the parallel
Chromium E2E jobs for React, Angular, Vue, Svelte and Vanilla JS. It uploads
HTML reports, screenshots, traces and videos for failures. A separate
`angular-package` job checks the Angular npm archive, minimum supported runtime
and production playground; the regular Angular E2E playground uses adapter
source. Docs-only changes skip the expensive build and browser checks, while
formatting and maintenance-tool checks still run. GitHub Pages deploys after
all required CI checks succeed on a push to `main`; deployment can also be
started from the CI workflow on `main`.

Coverage: views, navigation, range controls, density, styles, overlapping and
all-day events, recurrence, DST, JSON validation, Code mode and Reset.
API contracts and algorithm edge cases remain in the unit suites.
