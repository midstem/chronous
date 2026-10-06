# Chronous Svelte

[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous-svelte.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous-svelte

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

Chronous is a headless calendar for Svelte 5. It handles time zones, recurrence and event layout; you control the markup and styles. No stylesheet is required.

## Installation

```bash
npm install @midstem/chronous-svelte temporal-polyfill
```

The package includes the core engine. Import `temporal-polyfill/global` once in your app entry when you need exact recurrence and time-zone behavior. Svelte-aware build tools compile the published components for client and server rendering.

## Basic usage

```svelte
<script lang="ts">
  import { Calendar } from '@midstem/chronous-svelte'

  let range = $state({
    view: 'week' as const,
    currentDate: '2026-03-18',
    timeZone: 'Europe/Kyiv'
  })
  const events = [
    { id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' }
  ]
</script>

<Calendar.Root {range} {events} class="h-full overflow-auto rounded-xl border">
  {#snippet children()}
    <Calendar.Header>
      <Calendar.DayHeadings class="border-l py-2 text-center" />
    </Calendar.Header>
    <Calendar.AllDayRow />
    <Calendar.TimeGrid hourHeight={48}>
      {#snippet children()}
        <Calendar.TimeAxis>
          {#snippet children()}
            <Calendar.TimeLabels />
          {/snippet}
        </Calendar.TimeAxis>
        <Calendar.DayColumns>
          {#snippet children()}
            <Calendar.TimeSlots class="border-t" />
            <Calendar.TimedEvents class="rounded bg-blue-700 text-white">
              {#snippet children({ event })}{event.id}{/snippet}
            </Calendar.TimedEvents>
            <Calendar.NowMarker />
          {/snippet}
        </Calendar.DayColumns>
      {/snippet}
    </Calendar.TimeGrid>
  {/snippet}
</Calendar.Root>
```

## Documentation

See the [Svelte documentation](https://chronous.midstem.net/docs/?framework=svelte) for more examples, components, typed event data, navigation and how to load Temporal correctly. It also explains browser support and the behavior when Temporal is unavailable.

## License

MIT
