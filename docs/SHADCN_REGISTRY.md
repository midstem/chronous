# Install Chronous with shadcn/ui

Chronous provides a customizable React calendar with day, week, month and agenda
views as a shadcn registry item. The editable component uses your app's shadcn
`Button`, semantic Tailwind surfaces and the public `@midstem/chronous-react`
API. Like every shadcn/ui component, it is a single editable file. Safari still
lacks Temporal, so the component installs `temporal-polyfill` and imports its
global entry at the top of the file.

## Requirements

Use a React project initialized with shadcn/ui and Tailwind CSS. The installed
component imports `Button` from `@/components/ui/button` and `cn` from
`@/lib/utils`; the shadcn CLI rewrites both imports to the aliases configured in
your `components.json`. Run
installation commands from the app root where `components.json` lives. The
theme must expose shadcn's `chart-1` through `chart-5` color tokens.

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

The CLI writes one file, `components/ui/chronous-calendar.tsx`. It installs
`@midstem/chronous-react`, `temporal-polyfill`, `class-variance-authority` and
`lucide-react`, plus
the shadcn `button` when it is not already present.

## Use

```tsx
import {
  ChronousCalendar,
  type ChronousCalendarEvent
} from '@/components/ui/chronous-calendar'

const events: ChronousCalendarEvent[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00',
    duration: 'PT30M',
    data: { title: 'Standup', color: 'chart-1' }
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
      defaultDate="2026-03-18"
      defaultView="week"
      locale="en-GB"
    />
  )
}
```

The toolbar switches between Day, Week, Month and Agenda, and the previous, next and
today controls follow the selected view. Events default to an empty list. Each
event's `data.title` is required. Optional `data.color` accepts `chart-1` through
`chart-5`; events default to `chart-2`. The colors live in the exported
`calendarEventVariants` (cva), so adding a tone or a size is one edit.
`defaultView` defaults to `week`; `className` and other `section` props go to the
outer panel.

`defaultDate` and `defaultView` are read when the component mounts. When
`timeZone` is omitted, the component starts in UTC for server rendering, then
uses the browser's local IANA time zone after hydration. Pass `timeZone` to
choose a zone explicitly; all date and event calculations use that zone. Pass
a stable `defaultDate` when rendering on the server so server and browser begin
on the same week around midnight. `locale` controls date and event-time labels.
`scrollToHour` applies to day and week views; it defaults to `8`, accepts `0` to start
at midnight, and accepts `null` to keep the grid at the top.

The week view keeps day headings and all-day events visible while the time grid
scrolls. On narrow screens, the week and month days scroll horizontally within
the calendar. The month view shows two all-day lanes and up to two timed events
per day, with a count for additional events. Agenda shows event details and an
empty state when the selected period has no events.

## Build and preview locally

The registry is built with the official `shadcn build` command as part of
`npm run build:pages`, which writes `dist-pages/r/registry.json` and
`dist-pages/r/chronous-calendar.json` for static hosting. To generate just those
files for local inspection:

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

`npm run typecheck:registry` checks the component against the published
`@midstem/chronous-react` types, with `Button` and `cn` stubbed in
`tools/registry/shadcn.d.ts`.
