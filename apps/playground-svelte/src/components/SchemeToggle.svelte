<script lang="ts">
  import { DARK_LABEL, LIGHT_LABEL, opposite } from '@midstem/playground-core'
  import type { Scheme } from '@midstem/playground-core'

  let {
    pinned,
    resolved,
    toggle
  }: {
    pinned: Scheme | null
    resolved: Scheme
    toggle: () => void
  } = $props()

  let next = $derived(opposite(resolved))
</script>

<button
  type="button"
  class="ghost-button"
  aria-pressed={pinned !== null}
  title={pinned ? 'Follow the system setting' : `Pin the ${next} theme`}
  onclick={toggle}
>
  <span aria-hidden="true">{resolved === 'dark' ? '☾' : '☀'}</span>
  {resolved === 'dark' ? DARK_LABEL : LIGHT_LABEL}
</button>
