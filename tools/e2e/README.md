# E2E tests

The same 28 scenarios run on React, Angular, Vue, Svelte and Vanilla JS.
Selectors and actions live in [PlaygroundPage](pages/playground.ts), following
[Playwright POM](https://playwright.dev/docs/pom). Specs use the `playground` fixture.

```bash
npm run build
npm run test:e2e
PLAYGROUND=react npm run test:e2e -- --project=react
BROWSER=firefox npm run test:e2e
BROWSER=webkit npm run test:e2e
npm run test:e2e -- --ui
```

CI runs parallel jobs per framework in Chromium and uploads HTML reports,
screenshots, traces and videos for failures.

Coverage: views, navigation, range controls, density, styles, overlapping and
all-day events, recurrence, DST, JSON validation, Code mode and Reset.
API contracts and algorithm edge cases remain in the unit suites. Angular tests
use adapter source; GitHub Pages deployment does not wait for CI.
