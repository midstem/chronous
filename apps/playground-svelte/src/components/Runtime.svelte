<script lang="ts">
  import {
    BASELINE_NOTE,
    CLOSE_LABEL,
    COPY,
    DIALOG_TITLE,
    DOCS_LABEL,
    DOCS_URL,
    SUPPORT,
    SUPPORT_TITLE,
    runtimeStateOf
  } from '@midstem/playground-core'

  let dialog: HTMLDialogElement
  const titleId = 'runtime-dialog-title'
  const copy = COPY[runtimeStateOf()]

  const dismissed = (
    event: MouseEvent,
    targetDialog: HTMLDialogElement
  ): boolean => event.target === targetDialog
</script>

<button
  type="button"
  title={copy.summary}
  aria-haspopup="dialog"
  class="rounded-full border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-muted hover:border-line hover:text-ink"
  onclick={() => dialog?.showModal()}
>
  {copy.badge}
</button>

<dialog
  bind:this={dialog}
  closedby="any"
  aria-labelledby={titleId}
  class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/50"
  onclick={(event) => {
    if (dialog && dismissed(event, dialog)) dialog.close()
  }}
>
  <div class="flex flex-col gap-3 p-4">
    <h2 id={titleId} class="text-sm font-semibold">
      {DIALOG_TITLE}
    </h2>

    <p class="font-mono text-[11px] text-accent">{copy.badge}</p>

    <p class="text-[13px] leading-5">{copy.detail}</p>

    <section class="flex flex-col gap-1.5 rounded-lg bg-sunken p-3">
      <h3 class="text-[11px] font-semibold tracking-wide text-muted uppercase">
        {SUPPORT_TITLE}
      </h3>

      <ul class="flex flex-col gap-1">
        {#each SUPPORT as row (row.browser)}
          <li class="flex items-baseline justify-between gap-3 text-[12px]">
            <span>{row.browser}</span>
            <span class="flex items-baseline gap-2">
              <span class="font-mono tabular-nums">{row.since}</span>
              <span class="text-[11px] text-faint">{row.when}</span>
            </span>
          </li>
        {/each}
      </ul>

      <p class="pt-1 text-[11px] leading-4 text-muted">
        {BASELINE_NOTE}
      </p>
    </section>

    <div class="flex items-center justify-between gap-3">
      <a
        class="text-[12px] text-accent underline underline-offset-2"
        href={DOCS_URL}
        target="_blank"
        rel="noreferrer"
      >
        {DOCS_LABEL}
      </a>

      <button
        type="button"
        class="ghost-button"
        onclick={() => dialog?.close()}
      >
        {CLOSE_LABEL}
      </button>
    </div>
  </div>
</dialog>
