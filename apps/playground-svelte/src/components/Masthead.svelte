<script lang="ts">
  import {
    DOCS_LABEL,
    FRAMEWORK_NAV_LABEL,
    FRAMEWORK_LOGOS,
    HEADLINE,
    MODE_LABEL,
    MODES,
    REPOSITORY_URL,
    RESET_LABEL,
    TAGLINE,
    getFrameworkLinks,
    storedScheme,
    systemScheme,
    applyScheme,
    opposite,
    DARK_QUERY
  } from '@midstem/playground-core'
  import type { Mode, Scheme } from '@midstem/playground-core'
  import { onMount } from 'svelte'
  import Runtime from './Runtime.svelte'
  import SchemeToggle from './SchemeToggle.svelte'

  let {
    mode,
    onMode,
    reset
  }: { mode: Mode; onMode: (mode: Mode) => void; reset: () => void } = $props()

  let pinned = $state<Scheme | null>(storedScheme())
  let resolved = $state<Scheme>(systemScheme())

  const frameworks = getFrameworkLinks('svelte')

  $effect(() => applyScheme(pinned))

  onMount(() => {
    const media = window.matchMedia(DARK_QUERY)
    const sync = (): void => {
      resolved = systemScheme()
    }
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  })

  const toggle = (): void => {
    pinned = pinned ? null : opposite(resolved)
  }
</script>

<header
  class="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5"
>
  <h1 class="flex items-center gap-2 text-base font-semibold">
    <svg
      class="shrink-0"
      viewBox={FRAMEWORK_LOGOS.svelte.viewBox}
      width="24"
      height="24"
      aria-hidden="true">{@html FRAMEWORK_LOGOS.svelte.svg}</svg
    >
    <span class="flex items-baseline gap-2">
      {HEADLINE}
      <span class="text-xs font-normal text-faint">{TAGLINE}</span>
    </span>
  </h1>

  <nav
    class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5 embed:hidden"
    data-framework-nav
    aria-label={FRAMEWORK_NAV_LABEL}
  >
    {#each frameworks as link (link.id)}
      <a
        href={link.href}
        aria-current={link.isCurrent ? 'page' : undefined}
        class={`rounded px-3 py-1 text-[13px] font-medium no-underline transition-colors ${
          link.isCurrent
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:text-ink'
        }`}
      >
        {link.title}
      </a>
    {/each}
  </nav>

  <div
    class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
    role="group"
    aria-label={MODE_LABEL}
  >
    {#each MODES as option (option.value)}
      <button
        type="button"
        aria-pressed={option.value === mode}
        class={`rounded px-3 py-1 text-[13px] font-medium ${
          option.value === mode
            ? 'bg-accent-soft text-accent'
            : 'text-muted hover:text-ink'
        }`}
        onclick={() => onMode(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <div class="ml-auto flex flex-wrap items-center gap-2">
    <Runtime />
    <SchemeToggle {pinned} {resolved} {toggle} />
    <button type="button" class="ghost-button" onclick={reset}>
      {RESET_LABEL}
    </button>
    <a
      class="ghost-button"
      href={REPOSITORY_URL}
      target="_blank"
      rel="noreferrer"
    >
      {DOCS_LABEL}
    </a>
  </div>
</header>
