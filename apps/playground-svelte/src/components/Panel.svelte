<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    badge,
    children
  }: {
    title: string
    badge?: string
    children?: Snippet
  } = $props()
</script>

<section
  class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3"
>
  <h2
    class="flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-semibold"
  >
    {title}
    {#if badge}
      <span class="font-mono text-[10px] font-normal text-faint">
        {badge}
      </span>
    {/if}
  </h2>
  {@render children?.()}
</section>
