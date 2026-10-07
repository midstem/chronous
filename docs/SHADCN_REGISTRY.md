# Install Chronous with shadcn/ui

Chronous provides an editable React week calendar as a shadcn registry item.
The installed component uses your app's shadcn `Button`, Tailwind semantic
colors and the public `@midstem/chronous-react` API. It installs
`temporal-polyfill` and imports its global entry before initializing Chronous.
The calendar keeps its day headings and all-day events visible while the time
slots scroll. On narrow screens, the days scroll horizontally inside the
calendar region. Event titles and times use the app's semantic theme colors.

## Requirements

Use a React project initialized with shadcn/ui and Tailwind CSS. The installed
component imports `Button` from `@/components/ui/button`; the shadcn CLI rewrites
that import to the `aliases.ui` path configured in your `components.json`. Run
installation commands from the app root where `components.json` lives.

## Install

Once the Chronous GitHub Pages deployment includes the registry files, add the
component directly by URL:

```sh
npx shadcn@latest add https://midstem.github.io/chronous/r/chronous-calendar.json
```

Or add the namespace to `components.json` and install by item name:

```json
{
  "registries": {
    "@chronous": "https://midstem.github.io/chronous/r/{name}.json"
  }
}
```

```sh
npx shadcn@latest add @chronous/chronous-calendar
```

The CLI writes an editable `components/ui/chronous-calendar.tsx`, installs
`@midstem/chronous-react` and `temporal-polyfill`, and installs the shadcn
`button` registry dependency when it is not already present.

## Use

```tsx
import { ChronousCalendar } from '@/components/ui/chronous-calendar'
import type { EventInput } from '@midstem/chronous-react'

const events: EventInput<{ title: string }>[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00',
    duration: 'PT30M',
    data: { title: 'Standup' }
  },
  {
    id: 'holiday',
    start: '2026-03-20',
    duration: 'P1D',
    allDay: true,
    data: { title: 'Holiday' }
  }
]

export function Schedule() {
  return (
    <ChronousCalendar
      events={events}
      initialDate="2026-03-18"
      locale="en-GB"
      timeZone="Europe/Kyiv"
    />
  )
}
```

`events` defaults to an empty list. `initialDate` chooses the initial week and
is read on mount. When omitted, the component starts from today's date in the
selected `timeZone`. Change `timeZone` to render the same week in another zone;
`locale` controls the month label and Chronous day headings. `scrollToHour`
sets the initial vertical scroll position; it defaults to `8`, accepts `0` to
show midnight, and accepts `null` to keep the grid at the top. For server-rendered
apps, pass a stable `initialDate` so the server and browser start on the same
week, including around midnight.

## Build and preview locally

The registry is built as part of `npm run build:pages`, which writes
`dist-pages/r/registry.json` and `dist-pages/r/chronous-calendar.json` for static
hosting. To generate just those files for local inspection:

```sh
npm run build:registry
```

Then serve `dist-registry` on port 3000 and try the CLI commands:

```sh
npx http-server dist-registry -p 3000
npx shadcn@latest list http://localhost:3000/r/registry.json
npx shadcn@latest view http://localhost:3000/r/chronous-calendar.json
```

From the consuming shadcn app, install the locally served item with:

```sh
npx shadcn@latest add http://localhost:3000/r/chronous-calendar.json
```

Run `npm run test:registry` for generator coverage. `npm run build:pages` also
builds the registry alongside the playgrounds before GitHub Pages deployment.
