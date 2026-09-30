<script lang="ts">
  import type {
    CalendarRange,
    EventInput,
    LocaleId
  } from '@midstem/chronous-svelte'
  import {
    COPIED_LABEL,
    COPIED_MS,
    COPY_LABEL,
    TOKEN_STYLES,
    highlight
  } from '@midstem/playground-core'
  import type { EventData } from '@midstem/playground-core'
  let {
    source,
    range,
    events,
    locale,
    hourHeight
  }: {
    source: string
    range: CalendarRange
    events: readonly EventInput<EventData>[]
    locale: LocaleId
    hourHeight: number
  } = $props()
  let copied = $state(false)
  let tokens = $derived(highlight(source))
  let badge = $derived(
    `${range.view} · ${hourHeight}px per hour · ${locale} · ${events.length} events`
  )
  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(source)
    copied = true
    window.setTimeout(() => (copied = false), COPIED_MS)
  }
</script>

<div class="flex min-h-0 flex-1 flex-col p-4">
  <header class="flex flex-wrap items-center gap-3 pb-3">
    <h2 class="font-mono text-lg font-semibold">Calendar.svelte</h2>
    <span class="font-mono text-[11px] text-faint">{badge}</span><button
      type="button"
      class="ghost-button ml-auto"
      onclick={copy}>{copied ? COPIED_LABEL : COPY_LABEL}</button
    >
  </header>
  <section
    class="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
  >
    <pre
      class="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-5 text-code-plain">{#each tokens as token, index (`${index}-${token.kind}`)}<span
          class={TOKEN_STYLES[token.kind]}>{token.text}</span
        >{/each}</pre>
  </section>
  <p class="pt-2 text-[11px] leading-4 text-muted">
    The board as one standalone Svelte component, using the Svelte adapter and
    the current range and fixture.
  </p>
</div>
