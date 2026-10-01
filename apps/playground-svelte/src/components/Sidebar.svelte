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
  import Panel from './Panel.svelte'

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
    {#each TABS as item (item.id)}
      <button
        type="button"
        aria-pressed={item.id === tab}
        class={`rounded-t-md border-b-2 px-3 py-2 text-[13px] font-medium ${
          item.id === tab
            ? 'border-accent text-accent'
            : 'border-transparent text-muted hover:text-ink'
        }`}
        onclick={() => (tab = item.id)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div class="flex min-h-0 flex-1 flex-col p-3">
    {#if tab === 'range'}
      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
        <Panel title="Style" badge="playground only">
          <div class="flex flex-col gap-1">
            <label class="sr-only" for="style">style</label>
            <select
              id="style"
              class="field-control"
              value={config.style}
              onchange={(e) => update({ style: input(e) as Style })}
            >
              {#each STYLE_OPTIONS as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-[11px] leading-4 text-muted">{STYLE_HINT}</span>
          </div>
        </Panel>

        <Panel title="Fixture" badge="playground only">
          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="preset"
            >
              preset
            </label>
            <select
              id="preset"
              class="field-control"
              value={config.preset}
              onchange={(e) => choosePreset(input(e) as PresetId)}
            >
              {#each presets as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-[11px] leading-4 text-muted">{PRESET_HINT}</span>
          </div>
        </Panel>

        <Panel title="CalendarRange" badge="buildCalendar argument">
          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="view"
            >
              view
            </label>
            <select
              id="view"
              class="field-control"
              value={config.view}
              onchange={(e) => update({ view: input(e) as ViewKind })}
            >
              {#each VIEW_OPTIONS as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-[11px] leading-4 text-muted">{VIEW_HINT}</span>
          </div>

          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="currentDate"
            >
              currentDate
            </label>
            <input
              id="currentDate"
              class="field-control"
              type="date"
              value={config.currentDate}
              onchange={(e) => update({ currentDate: input(e) })}
            />
            <span class="text-[11px] leading-4 text-muted">{DATE_HINT}</span>
          </div>

          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="timeZone"
            >
              timeZone
            </label>
            <input
              id="timeZone"
              class="field-control"
              list="zones"
              value={config.timeZone}
              oninput={(e) => update({ timeZone: input(e) })}
            />
            <datalist id="zones">
              {#each ZONES as zone (zone)}
                <option value={zone}></option>
              {/each}
            </datalist>
            <span class="text-[11px] leading-4 text-muted"
              >{TIME_ZONE_HINT}</span
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="weekStartsOn"
            >
              weekStartsOn
            </label>
            <select
              id="weekStartsOn"
              class="field-control"
              value={config.weekStartsOn}
              onchange={(e) => update({ weekStartsOn: input(e) })}
            >
              {#each WEEK_STARTS_ON_OPTIONS as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-[11px] leading-4 text-muted"
              >{WEEK_STARTS_ON_HINT}</span
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="dayCount"
            >
              dayCount
            </label>
            <input
              id="dayCount"
              class="field-control"
              type="number"
              placeholder="unset"
              value={config.dayCount}
              oninput={(e) => update({ dayCount: input(e) })}
            />
            <span class="text-[11px] leading-4 text-muted"
              >{DAY_COUNT_HINT}</span
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="slotMinutes"
            >
              slotMinutes
            </label>
            <input
              id="slotMinutes"
              class="field-control"
              type="number"
              placeholder="unset"
              value={config.slotMinutes}
              oninput={(e) => update({ slotMinutes: input(e) })}
            />
            <span class="text-[11px] leading-4 text-muted"
              >{SLOT_MINUTES_HINT}</span
            >
          </div>

          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="disambiguation"
            >
              disambiguation
            </label>
            <select
              id="disambiguation"
              class="field-control"
              value={config.disambiguation}
              onchange={(e) => update({ disambiguation: input(e) })}
            >
              {#each DISAMBIGUATION_OPTIONS as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-[11px] leading-4 text-muted"
              >{DISAMBIGUATION_HINT}</span
            >
          </div>
        </Panel>

        <Panel title="Labels" badge="playground only">
          <div class="flex flex-col gap-1">
            <label
              class="font-mono text-xs font-semibold tracking-tight text-ink"
              for="locale"
            >
              locale
            </label>
            <input
              id="locale"
              class="field-control"
              list="locales"
              value={config.locale}
              oninput={(e) => update({ locale: input(e) })}
            />
            <datalist id="locales">
              {#each LOCALES as locale (locale)}
                <option value={locale}></option>
              {/each}
            </datalist>
            <span class="text-[11px] leading-4 text-muted">{LOCALE_HINT}</span>
          </div>
        </Panel>
      </div>
    {:else}
      <div class="flex min-h-0 flex-1 flex-col gap-2">
        <p class="text-[11px] leading-4 text-muted">
          {presetOf(config.preset).hint}
        </p>
        <p class="font-mono text-[10px] text-faint">
          EventInput[] · {events.length} on the board
        </p>
        <textarea
          class={`field-control min-h-0 flex-1 resize-none font-mono text-[11px] leading-5 ${problem ? 'border-danger' : ''}`}
          aria-label="Events JSON"
          spellcheck="false"
          rows={ROWS}
          value={source}
          oninput={(e) =>
            changeSource((e.currentTarget as HTMLTextAreaElement).value)}
        ></textarea>
        {#if problem}
          <p role="alert" class="text-[11px] leading-4 text-danger">
            {problem}
          </p>
        {:else}
          <p class="text-[11px] leading-4 text-muted">
            {EVENTS_HINT}
          </p>
        {/if}
      </div>
    {/if}
  </div>
</aside>
