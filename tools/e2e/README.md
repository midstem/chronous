# Chronous E2E Testing Suite

Framework-agnostic end-to-end (E2E) test suite powered by [Playwright](https://playwright.dev/).

It verifies that Chronous functions identically and without regressions across all supported UI framework adapters (`React`, `Angular`, `Vue`, `Svelte`, `Vanilla JS`).

---

## 🎯 Architecture & Philosophy

1. **Universal Test Specifications**: Tests are written once against semantic roles, standard user interactions, and DOM behaviors that all framework playgrounds share.
2. **Framework Registry**: Playgrounds are registered in [`playgrounds.ts`](./playgrounds.ts). Each entry specifies the playground ID, display name, dev server port, and workspace path.
3. **Zero Rewrites for Future Adapters**: Adding a new framework adapter (e.g. Solid, Web Components, Qwik) requires **only** registering its playground in `playgrounds.ts`. The full test suite runs automatically against it.
4. **Parallel Execution**: Tests execute across multiple workers and projects in parallel (`fullyParallel: true`), spinning up dedicated Vite dev servers per project.

---

## 🚀 Running Tests

### Run all frameworks in parallel
```bash
npm run test:e2e
```

### Run against a specific framework
```bash
npm run test:e2e -- --project=react
npm run test:e2e -- --project=angular
npm run test:e2e -- --project=vue
npm run test:e2e -- --project=svelte
npm run test:e2e -- --project=vanilla
```

### Run on different browsers
```bash
npm run test:e2e:firefox
npm run test:e2e --workspace @tools/e2e -- --project=react --browser=webkit
```

### Run in UI / debug mode
```bash
npm run test:e2e --workspace @tools/e2e -- --ui
```

---

## 📁 Project Structure

```
tools/e2e/
├── playgrounds.ts         # Central playground registry (ports, paths, IDs)
├── playwright.config.ts   # Multi-project & webServer configuration
├── package.json           # Workspace package definition
├── tsconfig.json          # TypeScript configuration
├── tests/
│   ├── helpers.ts         # Shared framework-agnostic interaction helpers
│   ├── initial.spec.ts    # Sanity checks, masthead, initial week view & engine state
│   ├── views.spec.ts      # Switching between day, week, days, month, agenda views
│   ├── navigation.spec.ts # Period navigation (next, previous, today) across views
│   ├── presets.spec.ts    # Switching event presets (showcase, overlaps, recurrence, etc.)
│   ├── controls.spec.ts   # Density, date picker, and appearance styles
│   ├── mode.spec.ts       # Stage modes (Calendar vs Code) and Reset button
│   └── events.spec.ts     # Live events JSON editor and calendar reactive updates
└── README.md
```

---

## ➕ Adding a New Playground

When adding a new framework adapter playground (e.g., `apps/playground-solid`):

1. Add an entry to `PLAYGROUNDS` in [`playgrounds.ts`](./playgrounds.ts):

```typescript
{
  id: 'solid',
  name: 'Solid',
  port: 3105,
  path: '../../apps/playground-solid',
  packageName: '@midstem/chronous-solid'
}
```

2. That's it! Playwright automatically provisions a Vite dev server on port `3105` and runs the full test suite against your new playground.
