# Publishing

This repository publishes three packages under the `@midstem` scope —
`@midstem/chronous` from `packages/core`, `@midstem/chronous-react` from
`packages/react` and `@midstem/chronous-angular` from `packages/angular` — and
each one is released on its own.

`@midstem/chronous` is the engine itself: the scheduling model, layout and
recurrence, with no framework and no DOM. Both adapters are built on it and
re-export all of it, so a consumer installs one package.

`@midstem/chronous-react` **inlines the engine at build time** rather than
declaring it as a dependency, so a React app never ends up with two versions
that have to line up. `verify:dist` is what holds that: it fails the build if
the React bundle still resolves `@midstem/chronous` at runtime, if a bundle
still carries `#src` imports, or if a public `.d.ts` names the `Temporal`
namespace.

`@midstem/chronous-angular` cannot do the same, because a published Angular
library ships linkable partial declarations rather than a rolled-up bundle. It
depends on `^1.0.0` of the engine the ordinary way, so npm installs it
transitively and an engine patch reaches Angular users without an Angular
release. `verify:dist` checks instead that its output carries the
`ɵɵngDeclare*` declarations the consumer's linker needs.

An engine change therefore reaches React users only through a React release, and
reaches the engine's own users through an engine release.

**Versions are independent.** A bug in an adapter is that adapter's patch and
leaves the engine alone. The numbers are free to drift, and they will.

## The tag names the package

A release tag is the npm coordinate of exactly one package:

```
@midstem/chronous@1.0.0
@midstem/chronous-react@1.0.1
@midstem/chronous-angular@1.0.0
```

This is the convention Lerna's independent mode and Changesets use in a
monorepo, and the reason a bare `1.0.1` does not work: with three packages in
the tree it does not say what was released. The bare `1.0.0` through `1.0.2` tags
that already exist belong to the previous generation, which shipped as the
unscoped `chronous` package; leave them alone.

`.github/scripts/release-tag.mjs` parses the tag, refuses anything that is not
`<npm name>@<version>`, refuses private workspaces, and fails the release unless
the version in that package's `package.json` matches the tag exactly. Nothing
else in the workflow decides which package goes out.

## The CLI does all of this

```bash
npm run release
```

It lists the publishable packages with their local and published versions, asks
which one you mean, and then does whichever half of the job is due:

- **the local version is already on npm** — it offers patch, minor, major,
  prerelease or a version you type, writes it to that package's `package.json`
  and to the one line of `package-lock.json` that carries it, and prints the git
  commands for getting it onto `main`;
- **the local version is not on npm yet** — it checks that you are on `main`,
  clean, in sync with `origin`, that `HEAD` really carries that version, and that
  neither the tag nor the release exists; asks for an optional line to put above
  the generated notes; shows the exact tag, target commit and dist-tag, and
  creates the release once you confirm.

So a release is two runs: one to bump, one to tag. `npm run release -- --dry-run`
walks the same path and writes nothing — it prints the `gh` command it would have
run. The CLI needs [gh](https://cli.github.com) and a terminal, because it asks
questions and `gh` is what creates the release.

Everything below is what the CLI does on your behalf, for when you want to do it
by hand or need to fix something it refuses to touch.

## 1. Prepare the release branch

- bump `version` in the package you are releasing — one of
  `packages/core/package.json`, `packages/react/package.json` or
  `packages/angular/package.json`, never two in one tag;
- keep `package-lock.json` in step: the `packages/<dir>` entry repeats that
  version, and `npm ci` fails when the two disagree. `npm run release` edits that
  one line for you;
- update the package's `README.md` and `CHANGELOG.md` if the public API moved.

Releasing the adapters after an engine change is one bump, one tag and one
release each. They are independent, so the order does not matter.

## 2. Check it locally

The build comes first — `apps/demo` resolves the packages through their `dist`,
so lint and typecheck need it:

```bash
npm run build && npm run verify:dist && npm run lint && npm run typecheck && npm run test
```

`npm run test` runs the engine's suite on both the polyfill and native Temporal.

## 3. Merge into `main`

Wait for CI to go green on `main`. The release CLI refuses to tag a `HEAD` that
is not `origin/main`.

## 4. Create the GitHub release

```bash
gh release create @midstem/chronous-react@1.0.1 --target main \
  --title "@midstem/chronous-react@1.0.1" --notes "…"
```

The CLI writes those notes for you: it reads the package's previous tag from
`git tag --list "<package>@*"` and lists the commits since it that touched the
package — plus `packages/core`, for an adapter, because the engine ships with
it.

A prerelease version (anything with a hyphen, `1.0.0-beta.1`) is published on
npm's `next` dist-tag instead of `latest`, so `npm install @midstem/chronous`
keeps resolving to the last stable release. Mark the GitHub release as a
prerelease too, with `--prerelease`.

## 5. What the release workflow does

Publishing the release starts the `Release` workflow, which:

1. reads the package name and the npm dist-tag out of the tag, and checks the
   version against `package.json`;
2. builds the packages, then runs `verify:dist`, lint, typecheck and the tests
   for the whole repository;
3. runs `npm publish --workspace <package> --tag <latest|next>`.

Publishing goes out with npm provenance, which is why the job asks for
`id-token: write`. It needs an automation `NPM_TOKEN` in the repository secrets.

## 6. Confirm

```bash
npm view @midstem/chronous version
```

A version that is already on npm cannot be republished. If a release goes out
broken, fix it forward with the next patch — there is nothing to roll back to.
