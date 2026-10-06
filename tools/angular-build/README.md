# Angular release toolchain

This private workspace pins Angular 18.0.0, TypeScript 5.4.5 and ng-packagr 18.
The published adapter supports Angular 18+, while the local playground and
source unit tests keep using the repository's current Angular version.

`packages/angular` delegates its build to `scripts/build.mjs`. It compiles
against the pinned Angular types and emits Angular Package Format output with
partial declarations in `dist/fesm2022`. The engine stays a runtime dependency.
A temporary manifest lets ng-packagr generate output-relative paths without
changing the publishable workspace's own `dist` exports.

## Scripts

- `scripts/build.mjs` runs ng-packagr with Angular 18 types and temporary build
  configuration. It produces the publishable FESM2022 module and declarations.
- `scripts/minimum-consumer.mjs` compiles the actual README example with Angular
  18.0.0, applies the Angular linker, and creates a browser bundle without JIT.
- `scripts/verify-package.mjs` installs the packed Angular and core libraries in a
  temporary application, checks the minimum-version example in Chromium, then
  runs the 28 production playground scenarios against that installed package.

## Running the checks

From the repository root:

```bash
npm run build
npm run test:package:angular
```

The package check builds the libraries, packs and installs both Chronous npm
archives locally without registry access, then:

- compiles the Angular README example with Angular 18.0.0 and links it for a
  production browser build;
- verifies its initial render and reactive event/range updates without JIT;
- runs the existing 28 E2E scenarios against a production playground using the
  installed archive and the current Angular runtime.

Chromium must be installed for Playwright (`npx playwright install chromium`).
CI installs it before this check; Angular releases run the same check before
publishing. The development playground still imports adapter source by default.
The package check uses `CHRONOUS_ANGULAR_PACKAGE` only for its temporary build.
