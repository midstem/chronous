<script lang="ts">
  import type {
    CalendarRange,
    EventInput,
    LocaleId
  } from '@midstem/chronous-svelte'
  import { createCalendarComponents, useNow } from '@midstem/chronous-svelte'
  import {
    BACK_LABEL,
    DENSITIES,
    DENSITY_LABEL,
    GUTTER,
    NEXT_LABEL,
    VIEWS,
    hourHeightOf,
    isSimple,
    isSlotted,
    titleOf
  } from '@midstem/playground-core'
  import type { Density, EventData, Style } from '@midstem/playground-core'
  import State from './State.svelte'
  import Slotted from './Slotted.svelte'
  import Month from './Month.svelte'
  import Agenda from './Agenda.svelte'

  const C = createCalendarComponents<EventData>()
  let {
    range,
    events,
    locale,
    density,
    style,
    onNavigate,
    onDensity
  }: {
    range: CalendarRange
    events: readonly EventInput<EventData>[]
    locale: LocaleId
    density: Density
    style: Style
    onNavigate: (range: CalendarRange) => void
    onDensity: (density: Density) => void
  } = $props()
  let now = $derived(useNow(range.timeZone))
  let today = $derived($now?.date ?? null)
  let hourHeight = $derived(hourHeightOf(density))
  let plain = $derived(isSimple(style))
</script>

<C.Root
  {range}
  {events}
  {locale}
  gutterWidth={GUTTER}
  class="flex min-h-0 flex-1 flex-col p-4"
>
  {#snippet renderError(error)}
    <div class="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <p
        role="alert"
        class="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        <strong class="font-mono">{error.name}</strong>: {error.message}
      </p>
    </div>
  {/snippet}
  {#snippet children({ calendar })}
    {@render Toolbar(titleOf(calendar, locale))}
    <section
      class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
    >
      <div data-scroller class="min-h-0 flex-1 overflow-auto">
        {#if isSlotted(range.view)}
          <Slotted {locale} {hourHeight} {today} {plain} />
        {:else if range.view === 'month'}
          <Month {today} {plain} />
        {:else}
          <Agenda {locale} {today} {plain} />
        {/if}
      </div>
      <State {calendar} />
    </section>
  {/snippet}
</C.Root>

{#snippet Toolbar(calendarTitle: string)}
  <C.Toolbar {onNavigate} views={VIEWS}>
    {#snippet children({ navigation: nav, goTo, range: shown })}
      <header class="flex flex-wrap items-center gap-3 pb-3">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="ghost-button"
            aria-label={BACK_LABEL}
            disabled={!nav.prev}
            onclick={() => nav.prev && goTo(nav.prev)}>‹</button
          ><button
            type="button"
            class="ghost-button"
            disabled={!nav.today}
            onclick={() => nav.today && goTo(nav.today())}>Today</button
          ><button
            type="button"
            class="ghost-button"
            aria-label={NEXT_LABEL}
            disabled={!nav.next}
            onclick={() => nav.next && goTo(nav.next)}>›</button
          >
        </div>
        <h2 class="mr-auto truncate text-lg font-semibold">{calendarTitle}</h2>
        {#if isSlotted(range.view)}<div
            class="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
            role="group"
            aria-label={DENSITY_LABEL}
          >
            {#each DENSITIES as option (option.value)}
              <button
                type="button"
                class={`rounded px-2 py-1 text-xs font-medium ${
                  option.value === density
                    ? 'bg-accent-soft text-accent'
                    : 'text-muted hover:text-ink'
                }`}
                aria-pressed={option.value === density}
                onclick={() => onDensity(option.value)}>{option.label}</button
              >
            {/each}
          </div>{/if}
        <div
          class="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
        >
          {#each VIEWS as view (view)}
            <button
              type="button"
              class={`rounded px-2.5 py-1 text-xs font-medium capitalize ${
                view === shown.view
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:text-ink'
              }`}
              aria-pressed={view === shown.view}
              onclick={() => goTo(nav.withView(view))}>{view}</button
            >
          {/each}
        </div>
      </header>
    {/snippet}
  </C.Toolbar>
{/snippet}
