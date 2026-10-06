# Chronous

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless scheduling engine. The core owns time zones,
DST, recurrence and the layout of overlapping events; a thin adapter hands it to
your framework as hooks, signals and headless primitives. The markup, the CSS
and the accessibility stay yours — geometry is computed for you, with no
stylesheet to import.</p>

## Documentation

For calendar views, event and recurrence options, navigation, time zones and
framework-specific examples, see the full documentation at
[https://chronous.midstem.net/docs/](https://chronous.midstem.net/docs/).

## Packages

Every adapter includes the engine, so you install one Chronous package for your
framework. The core can also run on its own, without a framework or the DOM.

| Package                                           | Version                          | Size                                   |
| ------------------------------------------------- | -------------------------------- | -------------------------------------- |
| [`@midstem/chronous`](packages/core) — the engine | [![npm][v-core]][npm-core]       | [![bundle size][s-core]][b-core]       |
| [`@midstem/chronous-react`](packages/react)       | [![npm][v-react]][npm-react]     | [![bundle size][s-react]][b-react]     |
| [`@midstem/chronous-vue`](packages/vue)           | [![npm][v-vue]][npm-vue]         | [![bundle size][s-vue]][b-vue]         |
| [`@midstem/chronous-svelte`](packages/svelte)     | [![npm][v-svelte]][npm-svelte]   | [![bundle size][s-svelte]][b-svelte]   |
| [`@midstem/chronous-angular`](packages/angular)   | [![npm][v-angular]][npm-angular] | [![bundle size][s-angular]][b-angular] |

Size badges link to live bundlejs estimates of the packages' JavaScript exports,
minified and gzipped with each framework kept external. They exclude application
markup, styles and the Temporal polyfill. Svelte estimates use `svelte` and
`svelte/*` as externals; the result depends on Svelte compilation. Actual
application sizes depend on the imports and build configuration.

Follow a package link for its own README — installation and the shortest example
that draws a calendar. React provides hooks and headless components, Vue provides
composables and headless components, Svelte provides reactive helpers and
headless components, and Angular provides signals and headless directives.

For full time-zone, DST and recurrence behavior in runtimes without native
Temporal, install `temporal-polyfill` separately and import
`temporal-polyfill/global` once in your application entry point. See the
[Temporal guide](packages/core/DOCUMENTATIONS.md#temporal) for setup and fallback
limitations.

## Compared to FullCalendar

Chronous gives you a scheduling engine and headless primitives to compose your
own calendar. [FullCalendar](https://fullcalendar.io/) provides a calendar UI
with configurable views, themes and interactions.

| Area         | Chronous                                                         | FullCalendar                                                                    |
| ------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Rendering    | Calendar data, event geometry and composable headless primitives | Calendar components with render hooks and custom-view APIs                      |
| Styling      | Your markup and CSS; no required stylesheet                      | Skeleton CSS with stock or custom themes                                        |
| Integrations | Vanilla JS, React, Vue, Svelte 5 and Angular                     | Vanilla JS, React, Vue, Angular, Preact and Web Component                       |
| License      | MIT for the engine and all adapters                              | MIT for Standard; resource views and printer-friendly rendering require Premium |

Choose Chronous when you want to compose the calendar UI within your own design
system. FullCalendar is a good fit when you want an existing calendar UI with
built-in interactions such as event dragging and resizing. See its
[React integration](https://fullcalendar.io/docs/react),
[feature documentation](https://fullcalendar.io/docs) and
[license details](https://fullcalendar.io/license) for the comparison above.

## Playgrounds

Every adapter has an interactive playground: edit the range and events, inspect
the resulting calendar, and switch to the code snippet. Updates to the packages
and playgrounds on `main` deploy to GitHub Pages.

| Playground | Try it                                              | Source                                               |
| ---------- | --------------------------------------------------- | ---------------------------------------------------- |
| React      | [live](https://midstem.github.io/chronous/react/)   | [`apps/playground-react`](apps/playground-react)     |
| Vue        | [live](https://midstem.github.io/chronous/vue/)     | [`apps/playground-vue`](apps/playground-vue)         |
| Svelte     | [live](https://midstem.github.io/chronous/svelte/)  | [`apps/playground-svelte`](apps/playground-svelte)   |
| Angular    | [live](https://midstem.github.io/chronous/angular/) | [`apps/playground-angular`](apps/playground-angular) |
| Vanilla JS | [live](https://midstem.github.io/chronous/vanilla/) | [`apps/playground-vanilla`](apps/playground-vanilla) |

All five share their controls, fixtures and styles through
[`@midstem/playground-core`](packages/playground-core), so the same calendar
options can be tried across adapters.
[midstem.github.io/chronous](https://midstem.github.io/chronous/) links to all of
them.

To run a playground locally:

```bash
npm install
npm run build
npm start
```

`npm start` opens the React playground; `start:vue`, `start:svelte`,
`start:angular` and `start:vanilla` open the others. `npm run build:pages`
builds all five the way the deployment does.

## Documentation source

The documentation source is kept in the repository and is never published to npm:
[`packages/core/DOCUMENTATIONS.md`](packages/core/DOCUMENTATIONS.md) for the
engine, [`packages/react/DOCUMENTATIONS.md`](packages/react/DOCUMENTATIONS.md)
for React,
[`packages/angular/DOCUMENTATIONS.md`](packages/angular/DOCUMENTATIONS.md) for
Angular,
[`packages/vue/DOCUMENTATIONS.md`](packages/vue/DOCUMENTATIONS.md) for Vue,
[`packages/svelte/DOCUMENTATIONS.md`](packages/svelte/DOCUMENTATIONS.md) for Svelte,
and [DOCUMENTATIONS.md](DOCUMENTATIONS.md) for the repository
itself — layout, the playground, benchmarks and how a release is cut.

## License

[MIT](LICENSE)

[npm-core]: https://npmjs.org/package/@midstem/chronous
[v-core]: https://img.shields.io/npm/v/%40midstem%2Fchronous.svg
[s-core]: https://deno.bundlejs.com/badge?q=@midstem/chronous
[b-core]: https://bundlejs.com/?q=%40midstem%2Fchronous
[npm-react]: https://npmjs.org/package/@midstem/chronous-react
[v-react]: https://img.shields.io/npm/v/%40midstem%2Fchronous-react.svg
[s-react]: https://deno.bundlejs.com/badge?q=@midstem/chronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[b-react]: https://bundlejs.com/?q=%40midstem%2Fchronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[npm-vue]: https://npmjs.org/package/@midstem/chronous-vue
[v-vue]: https://img.shields.io/npm/v/%40midstem%2Fchronous-vue.svg
[s-vue]: https://deno.bundlejs.com/badge?q=@midstem/chronous-vue&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[b-vue]: https://bundlejs.com/?q=%40midstem%2Fchronous-vue&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[npm-svelte]: https://npmjs.org/package/@midstem/chronous-svelte
[v-svelte]: https://img.shields.io/npm/v/%40midstem%2Fchronous-svelte.svg
[s-svelte]: https://deno.bundlejs.com/badge?q=@midstem/chronous-svelte&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22svelte%22%2C%22svelte%2F%2A%22%5D%7D%7D
[b-svelte]: https://bundlejs.com/?q=%40midstem%2Fchronous-svelte&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22svelte%22%2C%22svelte%2F%2A%22%5D%7D%7D
[npm-angular]: https://npmjs.org/package/@midstem/chronous-angular
[v-angular]: https://img.shields.io/npm/v/%40midstem%2Fchronous-angular.svg
[s-angular]: https://deno.bundlejs.com/badge?q=@midstem/chronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%5D%7D%7D
[b-angular]: https://bundlejs.com/?q=%40midstem%2Fchronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%5D%7D%7D
