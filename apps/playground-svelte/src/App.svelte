<script lang="ts">
  import type { CalendarRange, EventInput } from '@midstem/chronous-svelte'
  import {
    INITIAL_STATE,
    DEFAULT_MODE,
    DEFAULT_PRESET,
    presetOf,
    hourHeightOf
  } from '@midstem/playground-core'
  import type {
    EventData,
    Mode,
    PlaygroundState,
    PresetId
  } from '@midstem/playground-core'
  import {
    parseEvents as parse,
    rangeOf as makeRange,
    sourceOf as makeSource
  } from '@midstem/playground-core'
  import { snippetOf } from './snippet'
  import Board from './components/Board.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import Masthead from './components/Masthead.svelte'
  import Code from './components/Code.svelte'

  let config = $state<PlaygroundState>({ ...INITIAL_STATE })
  let source = $state(makeSource(DEFAULT_PRESET.events))
  let events = $state<readonly EventInput<EventData>[]>(DEFAULT_PRESET.events)
  let problem = $state<string | null>(null)
  let mode = $state<Mode>(DEFAULT_MODE)
  let range = $derived(makeRange(config))
  let hourHeight = $derived(hourHeightOf(config.density))
  let generated = $derived(
    snippetOf(range, events, config.locale, hourHeight, config.style)
  )

  const update = (patch: Partial<PlaygroundState>): void => {
    config = { ...config, ...patch }
  }

  const changeSource = (next: string): void => {
    source = next
    const parsed = parse(next)
    problem = parsed.problem
    if (parsed.problem === null && parsed.events !== null)
      events = parsed.events
  }

  const choosePreset = (id: PresetId): void => {
    const preset = presetOf(id)
    config = {
      ...config,
      preset: id,
      view: preset.view,
      currentDate: preset.date,
      timeZone: preset.timeZone
    }
    source = makeSource(preset.events)
    events = preset.events
    problem = null
  }

  const applyRange = (next: CalendarRange): void => {
    update({
      view: next.view,
      currentDate: next.currentDate,
      timeZone: next.timeZone
    })
  }

  const reset = (): void => {
    config = { ...INITIAL_STATE }
    source = makeSource(DEFAULT_PRESET.events)
    events = DEFAULT_PRESET.events
    problem = null
    mode = DEFAULT_MODE
  }
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
  <Masthead {mode} {reset} onMode={(next) => (mode = next)} />
  <div
    class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,16rem)_minmax(0,1fr)] lg:grid-cols-[minmax(300px,23vw)_minmax(0,1fr)] lg:grid-rows-1"
  >
    <Sidebar
      {config}
      {source}
      {problem}
      {events}
      {update}
      {choosePreset}
      {changeSource}
    />
    <main class="flex min-h-0 min-w-0 flex-col">
      {#if mode === 'calendar'}
        <Board
          {range}
          {events}
          locale={config.locale}
          density={config.density}
          style={config.style}
          onNavigate={applyRange}
          onDensity={(density) => update({ density })}
        />
      {:else}
        <Code
          source={generated}
          {range}
          {events}
          locale={config.locale}
          {hourHeight}
        />
      {/if}
    </main>
  </div>
</div>
