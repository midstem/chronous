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

export const createRuntime = (): {
  button: HTMLButtonElement
  dialog: HTMLDialogElement
} => {
  const copy = COPY[runtimeStateOf()]

  const button = document.createElement('button')
  button.type = 'button'
  button.title = copy.summary
  button.setAttribute('aria-haspopup', 'dialog')
  button.className =
    'rounded-full border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-muted hover:border-line hover:text-ink'
  button.textContent = copy.badge

  const dialog = document.createElement('dialog')
  dialog.className =
    'm-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/50'

  const titleId = 'runtime-dialog-title'
  dialog.setAttribute('aria-labelledby', titleId)

  dialog.innerHTML = `
    <div class="flex flex-col gap-3 p-4">
      <h2 id="${titleId}" class="text-sm font-semibold">${DIALOG_TITLE}</h2>
      <p class="font-mono text-[11px] text-accent">${copy.badge}</p>
      <p class="text-[13px] leading-5">${copy.detail}</p>
      <section class="flex flex-col gap-1.5 rounded-lg bg-sunken p-3">
        <h3 class="text-[11px] font-semibold tracking-wide text-muted uppercase">
          ${SUPPORT_TITLE}
        </h3>
        <ul class="flex flex-col gap-1">
          ${SUPPORT.map(
            (row) => `
            <li class="flex items-baseline justify-between gap-3 text-[12px]">
              <span>${row.browser}</span>
              <span class="flex items-baseline gap-2">
                <span class="font-mono tabular-nums">${row.since}</span>
                <span class="text-[11px] text-faint">${row.when}</span>
              </span>
            </li>`
          ).join('')}
        </ul>
        <p class="pt-1 text-[11px] leading-4 text-muted">${BASELINE_NOTE}</p>
      </section>
      <div class="flex items-center justify-between gap-3">
        <a
          class="text-[12px] text-accent underline underline-offset-2"
          href="${DOCS_URL}"
          target="_blank"
          rel="noreferrer"
        >
          ${DOCS_LABEL}
        </a>
        <button type="button" class="ghost-button" data-close-dialog>
          ${CLOSE_LABEL}
        </button>
      </div>
    </div>
  `

  button.addEventListener('click', () => {
    dialog.showModal()
  })

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close()
    }
  })

  const closeButton = dialog.querySelector<HTMLButtonElement>(
    '[data-close-dialog]'
  )
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      dialog.close()
    })
  }

  return { button, dialog }
}
