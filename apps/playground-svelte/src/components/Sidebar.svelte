<script lang="ts">
  import type { EventInput, ViewKind } from '@midstem/chronous-svelte'
  import {
    DEFAULT_TAB,
    TABS,
    STYLE_HINT,
    STYLE_OPTIONS,
    PRESET_HINT,
    PRESET_OPTIONS,
    VIEW_HINT,
    VIEW_OPTIONS,
    DATE_HINT,
    TIME_ZONE_HINT,
    ZONES,
    WEEK_STARTS_ON_HINT,
    WEEK_STARTS_ON_OPTIONS,
    DAY_COUNT_HINT,
    SLOT_MINUTES_HINT,
    DISAMBIGUATION_HINT,
    DISAMBIGUATION_OPTIONS,
    LOCALE_HINT,
    LOCALES,
    EVENTS_HINT,
    ROWS,
    presetOf
  } from '@midstem/playground-core'
  import type {
    EventData,
    PlaygroundState,
    PresetId,
    Style,
    TabId
  } from '@midstem/playground-core'

  let {
    config,
    source,
    problem,
    events,
    update,
    choosePreset,
    changeSource
  }: {
    config: PlaygroundState
    source: string
    problem: string | null
    events: readonly EventInput<EventData>[]
    update: (patch: Partial<PlaygroundState>) => void
    choosePreset: (id: PresetId) => void
    changeSource: (source: string) => void
  } = $props()
  let tab = $state<TabId>(DEFAULT_TAB)
  const presets = PRESET_OPTIONS
  const input = (event: Event): string =>
    (event.currentTarget as HTMLInputElement).value
</script>

<aside class="flex min-h-0 flex-col border-r border-line bg-raised">
  <div class="flex shrink-0 gap-0.5 border-b border-line px-2 pt-2">
    {#each TABS as item (item.id)}<button
        type="button"
        aria-pressed={item.id === tab}
        class:tab-active={item.id === tab}
        class="rounded-t-md border-b-2 px-3 py-2 text-[13px] font-medium"
        onclick={() => (tab = item.id)}>{item.label}</button
      >{/each}
  </div>
  <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3">
    {#if tab === 'range'}
      <section
        class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3"
      >
        <h2 class="text-[13px] font-semibold">
          Style <span class="font-mono text-[10px] font-normal text-faint"
            >playground only</span
          >
        </h2>
        <label class="sr-only" for="style">style</label><select
          id="style"
          class="field-control"
          value={config.style}
          onchange={(e) => update({ style: input(e) as Style })}
          >{#each STYLE_OPTIONS as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}</select
        >
        <p class="text-[11px] leading-4 text-muted">{STYLE_HINT}</p>
      </section>
      <section
        class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3"
      >
        <h2 class="text-[13px] font-semibold">
          Fixture <span class="font-mono text-[10px] font-normal text-faint"
            >playground only</span
          >
        </h2>
        <label class="font-mono text-xs font-semibold" for="preset"
          >preset</label
        ><select
          id="preset"
          class="field-control"
          value={config.preset}
          onchange={(e) => choosePreset(input(e) as PresetId)}
          >{#each presets as option (option.value)}<option value={option.value}
              >{option.label}</option
            >{/each}</select
        >
        <p class="text-[11px] leading-4 text-muted">{PRESET_HINT}</p>
      </section>
      <section
        class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3"
      >
        <h2
          class="flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-semibold"
        >
          CalendarRange <span
            class="font-mono text-[10px] font-normal text-faint"
            >buildCalendar argument</span
          >
        </h2>
        <label class="font-mono text-xs font-semibold" for="view">view</label
        ><select
          id="view"
          class="field-control"
          value={config.view}
          onchange={(e) => update({ view: input(e) as ViewKind })}
          >{#each VIEW_OPTIONS as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}</select
        >
        <p class="text-[11px] leading-4 text-muted">{VIEW_HINT}</p>
        <label class="font-mono text-xs font-semibold" for="currentDate"
          >currentDate</label
        ><input
          id="currentDate"
          class="field-control"
          type="date"
          value={config.currentDate}
          onchange={(e) => update({ currentDate: input(e) })}
        />
        <p class="text-[11px] leading-4 text-muted">{DATE_HINT}</p>
        <label class="font-mono text-xs font-semibold" for="timeZone"
          >timeZone</label
        ><input
          id="timeZone"
          class="field-control"
          list="zones"
          value={config.timeZone}
          oninput={(e) => update({ timeZone: input(e) })}
        /><datalist id="zones"
          >{#each ZONES as zone (zone)}<option value={zone}
            ></option>{/each}</datalist
        >
        <p class="text-[11px] leading-4 text-muted">{TIME_ZONE_HINT}</p>
        <label class="font-mono text-xs font-semibold" for="weekStartsOn"
          >weekStartsOn</label
        ><select
          id="weekStartsOn"
          class="field-control"
          value={config.weekStartsOn}
          onchange={(e) => update({ weekStartsOn: input(e) })}
          >{#each WEEK_STARTS_ON_OPTIONS as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}</select
        >
        <p class="text-[11px] leading-4 text-muted">{WEEK_STARTS_ON_HINT}</p>
        <label class="font-mono text-xs font-semibold" for="dayCount"
          >dayCount</label
        ><input
          id="dayCount"
          class="field-control"
          type="number"
          placeholder="unset"
          value={config.dayCount}
          oninput={(e) => update({ dayCount: input(e) })}
        />
        <p class="text-[11px] leading-4 text-muted">{DAY_COUNT_HINT}</p>
        <label class="font-mono text-xs font-semibold" for="slotMinutes"
          >slotMinutes</label
        ><input
          id="slotMinutes"
          class="field-control"
          type="number"
          placeholder="unset"
          value={config.slotMinutes}
          oninput={(e) => update({ slotMinutes: input(e) })}
        />
        <p class="text-[11px] leading-4 text-muted">{SLOT_MINUTES_HINT}</p>
        <label class="font-mono text-xs font-semibold" for="disambiguation"
          >disambiguation</label
        ><select
          id="disambiguation"
          class="field-control"
          value={config.disambiguation}
          onchange={(e) => update({ disambiguation: input(e) })}
          >{#each DISAMBIGUATION_OPTIONS as option (option.value)}<option
              value={option.value}>{option.label}</option
            >{/each}</select
        >
        <p class="text-[11px] leading-4 text-muted">{DISAMBIGUATION_HINT}</p>
      </section>
      <section
        class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3"
      >
        <h2 class="text-[13px] font-semibold">
          Labels <span class="font-mono text-[10px] font-normal text-faint"
            >playground only</span
          >
        </h2>
        <label class="font-mono text-xs font-semibold" for="locale"
          >locale</label
        ><input
          id="locale"
          class="field-control"
          list="locales"
          value={config.locale}
          oninput={(e) => update({ locale: input(e) })}
        /><datalist id="locales"
          >{#each LOCALES as locale (locale)}<option value={locale}
            ></option>{/each}</datalist
        >
        <p class="text-[11px] leading-4 text-muted">{LOCALE_HINT}</p>
      </section>
    {:else}
      <p class="text-[11px] leading-4 text-muted">
        {presetOf(config.preset).hint}
      </p>
      <p class="font-mono text-[10px] text-faint">
        EventInput[] · {events.length} on the board
      </p>
      <textarea
        class:error={problem !== null}
        class="field-control min-h-0 flex-1 resize-none font-mono text-[11px] leading-5"
        aria-label="Events JSON"
        spellcheck="false"
        rows={ROWS}
        value={source}
        oninput={(e) =>
          changeSource((e.currentTarget as HTMLTextAreaElement).value)}
      ></textarea>
      {#if problem}<p role="alert" class="text-[11px] leading-4 text-danger">
          {problem}
        </p>{:else}<p class="text-[11px] leading-4 text-muted">
          {EVENTS_HINT}
        </p>{/if}
    {/if}
  </div>
</aside>

<style>
  .tab-active {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  .error {
    border-color: var(--color-danger);
  }
</style>
