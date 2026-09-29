# Chronous Vue

[![NPM version][npm-image]][npm-url] [![bundle size][size-image]][size-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous-vue.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous-vue
[size-image]: https://deno.bundlejs.com/badge?q=@midstem/chronous-vue&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D
[size-url]: https://bundlejs.com/?q=@midstem/chronous-vue&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

Chronous is a headless calendar for Vue 3. It handles time zones, recurrence and event layout; you control the markup and styles. No stylesheet is required.

## Installation

```bash
npm install @midstem/chronous-vue temporal-polyfill
```

[Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#browser_compatibility) is available in current Chrome, Edge and Firefox, but not yet in Safari. Install the polyfill for Safari and other browsers without native Temporal, then import `temporal-polyfill/global` once in your app entry point before rendering the calendar. The Vue package includes the core engine.

## Basic usage

This example uses Tailwind CSS for styling:

```vue
<script setup lang="ts">
import { Calendar } from '@midstem/chronous-vue'

const range = {
  view: 'week' as const,
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const events = [{ id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' }]
</script>

<template>
  <Calendar.Root
    :range="range"
    :events="events"
    class="h-full overflow-auto rounded-xl border"
  >
    <Calendar.Header>
      <Calendar.DayHeadings class="border-l py-2 text-center" />
    </Calendar.Header>
    <Calendar.TimeGrid :hour-height="48">
      <Calendar.TimeAxis>
        <Calendar.TimeLabels />
      </Calendar.TimeAxis>
      <Calendar.DayColumns>
        <Calendar.TimeSlots class="border-t" />
        <Calendar.TimedEvents
          class="rounded bg-blue-700 text-white"
          v-slot="{ event }"
        >
          {{ event.id }}
        </Calendar.TimedEvents>
      </Calendar.DayColumns>
    </Calendar.TimeGrid>
  </Calendar.Root>
</template>
```

## Documentation

See the [documentation](https://chronous.midstem.net/docs/) for more examples, components, typed event data, navigation and how to load Temporal correctly. It also explains browser support and the behavior when Temporal is unavailable.

## License

MIT
