# `@midstem/chronous-demo`

A real render of the engine through the React hooks: a time grid with packed
columns, lanes of all-day and multi-day bars, a month grid, and switches for
the view and the time zone.

It consumes `@midstem/chronous` and `@midstem/chronous-react` by name, so it
resolves their built output and their exports map the way an outside consumer
would. Build the packages first:

```bash
npm run build
```

Then run it:

```bash
npm run dev --workspace @midstem/chronous-demo
```

The app is private and is never published.
