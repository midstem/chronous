<script setup lang="ts">
import { ref } from 'vue'
import {
  BASELINE_NOTE,
  CLOSE_LABEL,
  COPY,
  DIALOG_TITLE,
  DOCS_URL,
  SUPPORT,
  SUPPORT_TITLE,
  runtimeStateOf
} from '@midstem/playground-core'

const dialog = ref<HTMLDialogElement | null>(null)
const state = runtimeStateOf()
const copy = COPY[state]
const dialogTitle = DIALOG_TITLE
const supportTitle = SUPPORT_TITLE
const support = SUPPORT
const baselineNote = BASELINE_NOTE
const docsUrl = DOCS_URL
const docsLabel = 'Learn about Temporal'
const closeLabel = CLOSE_LABEL

const openModal = (): void => {
  dialog.value?.showModal()
}

const closeModal = (): void => {
  dialog.value?.close()
}

const onBackdropClick = (event: MouseEvent): void => {
  if (dialog.value && event.target === dialog.value) {
    dialog.value.close()
  }
}
</script>

<template>
  <button
    type="button"
    :title="copy.summary"
    aria-haspopup="dialog"
    class="rounded-full border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-muted hover:border-line hover:text-ink"
    @click="openModal"
  >
    {{ copy.badge }}
  </button>

  <dialog
    ref="dialog"
    closedby="any"
    aria-labelledby="runtime-dialog-title"
    class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/50"
    @click="onBackdropClick"
  >
    <div class="flex flex-col gap-3 p-4">
      <h2 id="runtime-dialog-title" class="text-sm font-semibold">
        {{ dialogTitle }}
      </h2>

      <p class="font-mono text-[11px] text-accent">{{ copy.badge }}</p>

      <p class="text-[13px] leading-5">{{ copy.detail }}</p>

      <section class="flex flex-col gap-1.5 rounded-lg bg-sunken p-3">
        <h3 class="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {{ supportTitle }}
        </h3>

        <ul class="flex flex-col gap-1">
          <li
            v-for="row of support"
            :key="row.browser"
            class="flex items-baseline justify-between gap-3 text-[12px]"
          >
            <span>{{ row.browser }}</span>
            <span class="flex items-baseline gap-2">
              <span class="font-mono tabular-nums">{{ row.since }}</span>
              <span class="text-[11px] text-faint">{{ row.when }}</span>
            </span>
          </li>
        </ul>

        <p class="pt-1 text-[11px] leading-4 text-muted">
          {{ baselineNote }}
        </p>
      </section>

      <div class="flex items-center justify-between gap-3">
        <a
          class="text-[12px] text-accent underline underline-offset-2"
          :href="docsUrl"
          target="_blank"
          rel="noreferrer"
        >
          {{ docsLabel }}
        </a>

        <button type="button" class="ghost-button" @click="closeModal">
          {{ closeLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>
