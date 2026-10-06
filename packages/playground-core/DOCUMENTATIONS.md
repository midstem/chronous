# `@midstem/playground-core` agent reference

## Scope and source of truth

Private workspace package for the five playground apps. It contains shared
fixtures, labels, UI constants, state conversion, syntax highlighting and
browser utilities. It is not a published Chronous adapter and provides no
framework components or reactive state owner.

Use [src/index.ts](src/index.ts) for root exports and
[package.json](package.json) for resolution. Calendar engine contracts are in
[core](../core/DOCUMENTATIONS.md). Change shared behavior here when every
playground should receive it; keep framework lifecycle and rendering in `apps/`.

When changing a public contract, verify the implementation and exported types
and update this reference in the same change. Source code takes precedence over
examples or descriptions that disagree with it.

## Setup and imports

Workspace imports resolve directly to TypeScript source; the app's build tool
must compile it. The package depends on `@midstem/chronous` and has no build script.

```ts
import { INITIAL_STATE, parseEvents, rangeOf } from '@midstem/playground-core'
import '@midstem/playground-core/styles.css'
```

The wildcard export `./*` maps to `./src/*`; prefer root exports for shared APIs
and the explicit stylesheet export for CSS.

## Public API

The root barrel re-exports these groups; consult their index files for the full
symbol list rather than assuming an adapter API exists here.

| Group         | Source                                                      | Responsibility                                                                                        |
| ------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Playground    | [playground](src/playground/index.ts)                       | `INITIAL_STATE`, `rangeOf`, `sourceOf`, `parseEvents`, `PlaygroundState`, `Playground`, `ParseResult` |
| Fixtures      | [fixtures](src/fixtures/index.ts)                           | Shared presets and event payloads                                                                     |
| Labels        | [labels](src/labels/index.ts)                               | Shared date/time label formatting                                                                     |
| Board         | [board helpers](src/board/helpers.ts)                       | `periodDate`, `isSlotted`, `titleOf`                                                                  |
| State display | [state](src/state/index.ts)                                 | `summaryOf`, `jsonOf`, metrics and JSON truncation constants                                          |
| Frameworks    | [frameworks](src/frameworks/index.ts)                       | `getFrameworkLinks`, `getFrameworkLogo`, framework metadata                                           |
| Runtime       | [runtime](src/runtime/index.ts)                             | `runtimeStateOf`, Temporal status copy and metadata                                                   |
| Theme         | [theme](src/theme/index.ts)                                 | `opposite`, `systemScheme`, `storedScheme`, `applyScheme`                                             |
| Embed         | [embed](src/embed/index.ts)                                 | `isEmbedded`, `startEmbedBridge`, message types and constants                                         |
| Highlight     | [highlight](src/highlight/index.ts)                         | Code highlighting utilities                                                                           |
| Styles        | [styles](src/styles/index.ts), [styles.css](src/styles.css) | Shared style tokens and CSS                                                                           |
| UI vocabulary | [root barrel](src/index.ts)                                 | Tone, density, mode, style, option types and per-region constants                                     |

Root names disambiguate repeated constants: `MASTHEAD_DOCS_LABEL`,
`ALL_DAY_BAR_GAP`, `ALL_DAY_LANE_HEIGHT`, `MONTH_MAX_LANES`,
`MONTH_LANE_HEIGHT`, `MONTH_BAR_GAP`. Do not replace them with guessed names.

## Data and behavior contracts

- `EventData` is `{ title: string }`; fixtures and playground state use it.
- `PlaygroundState` stores optional range inputs as strings: `weekStartsOn`,
  `dayCount`, `slotMinutes`, `disambiguation`. `UNSET` is the empty string.
- `rangeOf(state)` omits unset optional fields and converts numeric strings
  with `Number`. It does not validate engine ranges; invalid numbers can reach
  `buildCalendar` and produce engine errors.
- `parseEvents(source)` returns `{ events, problem: null }` or
  `{ events: null, problem: string }`. It checks JSON syntax, an array, object
  entries and string `id`/`start` fields only. It does not validate ISO strings,
  recurrence rules, duration, or event payloads.
- `sourceOf(events)` serializes with two-space indentation. `jsonOf(calendar)`
  may truncate long output and append a notice; do not parse it as a payload.
- `summaryOf` reports layout counts, not unique input event counts; an event
  split between days or rows can contribute multiple boxes or bars.
- `periodDate` and `titleOf` expect a nonempty calendar day list.
- `Playground` is a TypeScript interface. Each app supplies its implementation
  of updates, source edits, preset changes, range application and reset.

## Minimal example

```ts
import { buildCalendar } from '@midstem/chronous'
import { INITIAL_STATE, parseEvents, rangeOf } from '@midstem/playground-core'

const range = rangeOf({
  ...INITIAL_STATE,
  view: 'day',
  currentDate: '2026-03-18'
})
const parsed = parseEvents('[{"id":"meeting","start":"2026-03-18T09:00"}]')
if (parsed.events !== null) {
  // Engine errors are handled by the app; parseEvents does not catch them.
  const calendar = buildCalendar(range, parsed.events)
  console.log(calendar.days.length)
}
```

## Errors and limitations

- Temporal status detection checks for `globalThis.Temporal`; `'missing'` does
  not mean the core Date fallback cannot render. See
  [browser behavior](../core/DOCUMENTATIONS.md#browser-behavior).
- Theme helpers access `window`, `document` and/or `localStorage`. Call browser
  helpers in the client lifecycle; storage or browser API errors propagate.
- `isEmbedded()` returns `false` without `window`. `startEmbedBridge()` returns
  a no-op cleanup without browser globals or embed mode. In a frame it requires
  `ResizeObserver`, reports body height to the parent, and registers a message
  listener. Call its returned cleanup on unmount.
- The embed bridge uses the referrer origin when available, otherwise `'*'`.
  A query-only embed sets `document.documentElement.dataset.embed` but does not
  start the frame bridge. Cleanup removes the observer and listener, not that
  data attribute.
- Do not infer current browser support from static playground copy; use actual
  runtime capability detection for execution decisions.

## Source map and validation

Start with the group entry above, then its `helpers.ts`, `types.ts` and
`constants.ts`. Consumers live in `../../apps/playground-*`.

Run from the repository root after building core when its declarations are needed:

```sh
npm run typecheck --workspace @midstem/playground-core
npm run test:run --workspace @midstem/playground-core
npx prettier --check packages/playground-core/DOCUMENTATIONS.md
```
