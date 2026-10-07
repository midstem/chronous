# Package consumer checks

Build package outputs first, then run the tarball consumers:

```sh
node tools/package-check/index.mjs
node tools/package-check/index.mjs --package react
node tools/package-check/index.mjs --package vue --minimum
```

The default checks all four packable packages with the framework peers already installed in the repository and installs each local tarball offline into a temporary consumer. `--minimum` installs the package's documented minimum framework peer versions in that temporary consumer and requires `--package`. Angular has a separate package verifier.

Each tarball must include its README, license, declared entrypoints, and public declarations, without source files. The consumer compiles the installed package's public types and exercises its ESM entrypoint; core, React, and Vue also check CommonJS exports. Adapter consumers fail if `@midstem/chronous` appears as an external dependency or cannot resolve independently. Framework checks render the exported calendar primitive with SSR; Svelte compiles the installed component for client and server output before SSR.

## Scenarios

```gherkin
Given a packed adapter with no installed core package
When a consumer compiles the public types and renders the exported Calendar primitive
Then the engine API and calendar markup work from the installed archive

Given a supported framework installed at the package's minimum peer version
When the consumer repeats the type, build, and render checks
Then the package works with that minimum peer set

Given an archive missing a declaration or declared entrypoint, or exposing core as an adapter dependency
When the package check inspects the archive
Then the check fails with the missing or external package identified

Given an unknown package selector or command option
When the checker parses its arguments
Then it exits with an error
```
