# Maintenance tools

- `node tools/maintenance/detect-changes.mjs --base SHA [--head SHA] [--merge-base]` classifies a diff and writes `code`/`pages` booleans to `GITHUB_OUTPUT` (or those two lines to stdout locally). Use `--merge-base` for pull request comparisons; omit it for exact push base/head comparisons.
- `node tools/maintenance/precommit.mjs` checks staged file contents only. It verifies Prettier formatting and lints staged JavaScript/TypeScript with the root ESLint config.
- `node tools/maintenance/report-size.mjs` measures built package entrypoints and prints Markdown. Use `--json PATH` to save a deterministic manifest, then `--current PATH [--base PATH]` to render a comparison. `--root PATH` measures another checkout.

The Svelte metric compiles the built public `Calendar` export and its reachable `.svelte` components to client JavaScript, bundles with esbuild, minifies, and gzips the result. Svelte runtime imports remain external. It represents a compiled consumer bundle, separate from the framework entrypoint measurements.

Run utility tests with `node --test tools/maintenance/*.test.mjs`.
