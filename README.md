# Chronous

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

Chronous is a headless calendar for JavaScript, React, Vue, Svelte and Angular.
We handle time zones, recurrence and event layout; you control the markup and
styles. No stylesheet required.

## Documentation

[chronous.midstem.net/docs](https://chronous.midstem.net/docs/)

## Install the React calendar with shadcn/ui

Install the day, week, month and agenda calendar into a shadcn app after the
Pages registry is published:

```sh
npx shadcn@latest add https://midstem.github.io/chronous/r/chronous-calendar.json
```

See the [registry installation guide](docs/SHADCN_REGISTRY.md) for setup,
namespace installation and usage.

## Packages

Each adapter includes the engine. Follow a package link for installation and examples.

| Package                                         | Version                          | Size                                   | FullCalendar                                                   |
| ----------------------------------------------- | -------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| [`@midstem/chronous`](packages/core)            | [![npm][v-core]][npm-core]       | [![bundle size][s-core]][b-core]       | [![FullCalendar size][sf-core]][bf-core] · ~3.8× smaller       |
| [`@midstem/chronous-react`](packages/react)     | [![npm][v-react]][npm-react]     | [![bundle size][s-react]][b-react]     | [![FullCalendar size][sf-react]][bf-react] · ~2.4× smaller     |
| [`@midstem/chronous-vue`](packages/vue)         | [![npm][v-vue]][npm-vue]         | [![bundle size][s-vue]][b-vue]         | [![FullCalendar size][sf-vue]][bf-vue] · ~2.8× smaller         |
| [`@midstem/chronous-svelte`](packages/svelte)   | [![npm][v-svelte]][npm-svelte]   | [![bundle size][s-svelte]][b-svelte]   | [![FullCalendar size][sf-svelte]][bf-svelte] · ~2.7× smaller   |
| [`@midstem/chronous-angular`](packages/angular) | [![npm][v-angular]][npm-angular] | [![bundle size][s-angular]][b-angular] | [![FullCalendar size][sf-angular]][bf-angular] · ~2.8× smaller |

Gzipped bundlejs estimates with frameworks external; ratios checked October 6, 2026. Svelte is compared with vanilla FullCalendar.

## Playgrounds

Try each integration: change calendar options and events, then inspect the result
and generated code.

| React                                             | Vue                                             | Svelte                                             | Angular                                             | Vanilla JS                                          |
| ------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| [live](https://midstem.github.io/chronous/react/) | [live](https://midstem.github.io/chronous/vue/) | [live](https://midstem.github.io/chronous/svelte/) | [live](https://midstem.github.io/chronous/angular/) | [live](https://midstem.github.io/chronous/vanilla/) |

[All playgrounds](https://midstem.github.io/chronous/)

## License

[MIT](LICENSE)

## Contributing

Bug reports, feature ideas and pull requests are welcome. See the
[contributing guide](CONTRIBUTING.md) for setup and checks. Public API and
release details live in the [package references](DOCUMENTATIONS.md) and
[publishing guide](docs/PUBLISH.md).

[npm-core]: https://npmjs.org/package/@midstem/chronous
[v-core]: https://img.shields.io/npm/v/%40midstem%2Fchronous.svg
[s-core]: https://deno.bundlejs.com/badge?q=%40midstem%2Fchronous
[b-core]: https://bundlejs.com/?q=%40midstem%2Fchronous
[sf-core]: https://deno.bundlejs.com/badge?q=fullcalendar
[bf-core]: https://bundlejs.com/?q=fullcalendar
[npm-react]: https://npmjs.org/package/@midstem/chronous-react
[v-react]: https://img.shields.io/npm/v/%40midstem%2Fchronous-react.svg
[s-react]: https://deno.bundlejs.com/badge?q=%40midstem%2Fchronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[b-react]: https://bundlejs.com/?q=%40midstem%2Fchronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[sf-react]: https://deno.bundlejs.com/badge?q=%40fullcalendar%2Freact&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[bf-react]: https://bundlejs.com/?q=%40fullcalendar%2Freact&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[npm-vue]: https://npmjs.org/package/@midstem/chronous-vue
[v-vue]: https://img.shields.io/npm/v/%40midstem%2Fchronous-vue.svg
[s-vue]: https://deno.bundlejs.com/badge?q=%40midstem%2Fchronous-vue&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[b-vue]: https://bundlejs.com/?q=%40midstem%2Fchronous-vue&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[sf-vue]: https://deno.bundlejs.com/badge?q=%40fullcalendar%2Fvue3&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[bf-vue]: https://bundlejs.com/?q=%40fullcalendar%2Fvue3&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[npm-svelte]: https://npmjs.org/package/@midstem/chronous-svelte
[v-svelte]: https://img.shields.io/npm/v/%40midstem%2Fchronous-svelte.svg
[s-svelte]: https://deno.bundlejs.com/badge?q=%40midstem%2Fchronous-svelte&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22svelte%22%2C%22svelte%2F%2A%22%5D%7D%7D
[b-svelte]: https://bundlejs.com/?q=%40midstem%2Fchronous-svelte&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22svelte%22%2C%22svelte%2F%2A%22%5D%7D%7D
[sf-svelte]: https://deno.bundlejs.com/badge?q=fullcalendar&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22svelte%22%2C%22svelte%2F%2A%22%5D%7D%7D
[bf-svelte]: https://bundlejs.com/?q=fullcalendar&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22svelte%22%2C%22svelte%2F%2A%22%5D%7D%7D
[npm-angular]: https://npmjs.org/package/@midstem/chronous-angular
[v-angular]: https://img.shields.io/npm/v/%40midstem%2Fchronous-angular.svg
[s-angular]: https://deno.bundlejs.com/badge?q=%40midstem%2Fchronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%2C%22%40angular%2Fcommon%22%2C%22rxjs%22%2C%22rxjs%2F%2A%22%5D%7D%7D
[b-angular]: https://bundlejs.com/?q=%40midstem%2Fchronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%2C%22%40angular%2Fcommon%22%2C%22rxjs%22%2C%22rxjs%2F%2A%22%5D%7D%7D
[sf-angular]: https://deno.bundlejs.com/badge?q=%40fullcalendar%2Fangular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%2C%22%40angular%2Fcommon%22%2C%22rxjs%22%2C%22rxjs%2F%2A%22%5D%7D%7D
[bf-angular]: https://bundlejs.com/?q=%40fullcalendar%2Fangular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%2C%22%40angular%2Fcommon%22%2C%22rxjs%22%2C%22rxjs%2F%2A%22%5D%7D%7D
