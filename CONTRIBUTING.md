# Contributing

Thanks for helping improve Chronous. For a bug report, include the affected
package and version, framework and browser versions, and a small reproduction.
For a feature request, describe the use case and the behavior you expect. The
issue forms help collect these details.

## Development setup

The [repository guide](DOCUMENTATIONS.md) maps the workspaces and links to the
[core reference](packages/core/DOCUMENTATIONS.md) and each adapter's package
reference. Work is organized as `packages/core` (engine),
`packages/{react,angular,vue,svelte}` (adapters), `apps/playground-*` (examples),
and `tools/` (release and validation tools).

Fork the repository, then create a topic branch from the current `main`:

```bash
git clone https://github.com/<your-user>/chronous.git
cd chronous
git remote add upstream https://github.com/midstem/chronous.git
git fetch upstream
git switch -c <topic-branch> upstream/main
```

Use Node.js 24.x and npm 11.x for repository development and CI. Install the
locked dependencies and build the packages before starting a playground:

```bash
npm ci
npm run build
npm start
```

`npm start` runs the React playground. To use another playground, run
`npm run start:vanilla`, `npm run start:angular`, `npm run start:vue`, or
`npm run start:svelte`. React, Vue, Svelte and Vanilla JS use the built package
outputs, so rebuild after changing their adapter or the core. Angular's normal
development playground uses adapter source; its package validation separately
checks the built npm archive.

The published packages declare Node.js `>=18`; this is their runtime support
floor. Repository development uses Node 24.x because that is the version used
by CI. Framework peer support is declared by each package: React `>=18`,
Angular `>=18`, Vue `>=3.4`, and Svelte `>=5`.

## Checks

For code or configuration changes, run the complete repository check before
opening a pull request:

```bash
npm run check
```

This runs, in order, the package build, distributable verification, formatting
check, lint, typecheck, one-shot tests and maintenance-tool tests (`test:infra`).
For documentation-only changes, `npm run format:check` is sufficient locally.
`npm test` is the one-shot test command. For an interactive watch run, use a
workspace, for example:

```bash
npm run test --workspace @midstem/chronous-react
```

The root wrapper `npm run test:package` builds and verifies output, then checks
the npm archives for core, React, Vue and Svelte with the installed framework
versions. To check one package directly, first build, then run (for example):

```bash
npm run build
npm run verify:package -- --package react --minimum
```

`verify:package` accepts `--package core|react|vue|svelte`; add `--minimum` to
install and check the minimum supported framework runtime. Angular has its own
archive and consumer check: `npm run test:package:angular`.

If you change package behavior, add or update the relevant tests and reference
documentation. A public API change should include documentation for its
observable contract. CI runs the same quality checks and browser E2E coverage;
the E2E setup is described in [`tools/e2e/README.md`](tools/e2e/README.md). CI
publishes an aggregate `CI checks` status that repository branch-protection
settings can require.

After building, `npm run size:report` reports minified and gzip sizes for all
packages. CI compares them with the PR base as an advisory report. See the
[maintenance tools](tools/maintenance/README.md) for details.

The `precommit` command checks staged files without modifying them. Formatting
is checked by `npm run format:check` (and by `npm run check`); format your
changes before committing.

## Pull requests

Keep a pull request focused and explain the user-visible result, the reason for
the change, and how you checked it. Link the related issue when there is one.
Call out breaking changes and include migration guidance. Update the package
reference when behavior or the public API changes. For release process and
versioning details, see [`docs/PUBLISH.md`](docs/PUBLISH.md).
