<script lang="ts">
  import type { CalendarLayout } from '@midstem/chronous-svelte'
  import { STATE_HINT, jsonOf, summaryOf } from '@midstem/playground-core'
  import type { EventData } from '@midstem/playground-core'
  let { calendar }: { calendar: CalendarLayout<EventData> } = $props()
  let open = $state(false)
</script>

<details class="shrink-0 border-t border-line bg-raised" bind:open>
  <summary
    class="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-muted"
  >
    {#each summaryOf(calendar) as item (item.label)}<span
        class="flex items-baseline gap-1"
        ><span class="text-faint">{item.label}</span><span
          class="font-mono text-ink">{item.value}</span
        ></span
      >{/each}
  </summary>
  <div class="flex flex-col gap-2 px-3 pb-3">
    <p class="text-[11px] text-muted">{STATE_HINT}</p>
    {#if open}<pre
        class="max-h-80 overflow-auto rounded-md bg-sunken p-3 font-mono text-[11px] leading-5">{jsonOf(
          calendar
        )}</pre>{/if}
  </div>
</details>
