<script lang="ts">
  import {
    COPY,
    MASTHEAD_DOCS_LABEL,
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
    DARK_QUERY,
    runtimeStateOf
  } from '@midstem/playground-core'
  import type { Mode, Scheme } from '@midstem/playground-core'
  import { onMount } from 'svelte'

  let {
    mode,
    onMode,
    reset
  }: { mode: Mode; onMode: (mode: Mode) => void; reset: () => void } = $props()
  let pinned = $state<Scheme | null>(storedScheme())
  let resolved = $state<Scheme>(systemScheme())
  let shownScheme = $derived(pinned ?? resolved)
  let dialog = $state(false)
  let dialogElement: HTMLDialogElement
  const runtime = runtimeStateOf()
  const runtimeCopy = COPY[runtime]
  const frameworks = getFrameworkLinks('svelte')
  $effect(() => applyScheme(pinned))
  $effect(() => {
    if (dialog && dialogElement && !dialogElement.open)
      dialogElement.showModal()
    if (!dialog && dialogElement?.open) dialogElement.close()
  })
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
    <span class="flex items-baseline gap-2"
      >{HEADLINE}<span class="text-xs font-normal text-faint">{TAGLINE}</span
      ></span
    >
  </h1>
  <nav
    class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
    aria-label={FRAMEWORK_NAV_LABEL}
  >
    {#each frameworks as link (link.id)}<a
        href={link.href}
        aria-current={link.isCurrent ? 'page' : undefined}
        class:current={link.isCurrent}
        class="rounded px-3 py-1 text-[13px] font-medium no-underline text-muted hover:text-ink"
        >{link.title}</a
      >{/each}
  </nav>
  <div
    class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
    role="group"
    aria-label={MODE_LABEL}
  >
    {#each MODES as option (option.value)}<button
        type="button"
        aria-pressed={option.value === mode}
        class:active={option.value === mode}
        class="rounded px-3 py-1 text-[13px] font-medium"
        onclick={() => onMode(option.value)}>{option.label}</button
      >{/each}
  </div>
  <div class="ml-auto flex flex-wrap items-center gap-2">
    <button type="button" class="ghost-button" onclick={() => (dialog = true)}
      >{runtimeCopy.badge}</button
    >
    <button
      type="button"
      class="ghost-button"
      aria-label="Toggle color scheme"
      onclick={toggle}>{shownScheme}</button
    >
    <button type="button" class="ghost-button" onclick={reset}
      >{RESET_LABEL}</button
    >
    <a
      class="ghost-button"
      href={REPOSITORY_URL}
      target="_blank"
      rel="noreferrer">{MASTHEAD_DOCS_LABEL}</a
    >
  </div>
</header>
<dialog
  bind:this={dialogElement}
  onclose={() => (dialog = false)}
  class="max-w-lg rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-black/40"
>
  <section aria-labelledby="runtime-title">
    <div class="flex items-center justify-between gap-4">
      <h2 id="runtime-title" class="text-lg font-semibold">
        Temporal in this browser
      </h2>
      <button class="ghost-button" onclick={() => (dialog = false)}
        >Close</button
      >
    </div>
    <p class="mt-3 text-sm font-medium">{runtimeCopy.summary}</p>
    <p class="mt-2 text-sm text-muted">{runtimeCopy.detail}</p>
    <a
      class="mt-3 inline-block text-sm text-accent"
      href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal"
      target="_blank"
      rel="noreferrer">MDN: Temporal</a
    >
  </section>
</dialog>

<style>
  .current,
  .active {
    background: var(--color-accent-soft);
    color: var(--color-accent);
  }
</style>
