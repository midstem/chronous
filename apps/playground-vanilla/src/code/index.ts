import {
  COPIED_LABEL,
  COPIED_MS,
  COPY_LABEL,
  TOKEN_STYLES,
  highlight
} from '@midstem/playground-core'

export type CodeProps = {
  fileName: string
  badge: string
  hint: string
  source: string
}

export const createCodeView = (props: CodeProps): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'flex min-h-0 flex-1 flex-col p-4'

  let copied = false

  const tokens = highlight(props.source)
  const tokensHtml = tokens
    .map(
      (token) =>
        `<span class="${TOKEN_STYLES[token.kind]}">${token.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</span>`
    )
    .join('')

  const render = (): void => {
    container.innerHTML = `
      <header class="flex flex-wrap items-center gap-3 pb-3">
        <h2 class="font-mono text-lg font-semibold">${props.fileName}</h2>
        <span class="font-mono text-[11px] text-faint">${props.badge}</span>
        <button type="button" class="ghost-button ml-auto" data-copy>
          ${copied ? COPIED_LABEL : COPY_LABEL}
        </button>
      </header>

      <section class="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <pre class="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-5 text-code-plain">${tokensHtml}</pre>
      </section>

      <p class="pt-2 text-[11px] leading-4 text-muted">${props.hint}</p>
    `

    const copyBtn = container.querySelector<HTMLButtonElement>('[data-copy]')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        void navigator.clipboard.writeText(props.source).then(() => {
          copied = true
          copyBtn.textContent = COPIED_LABEL
          window.setTimeout(() => {
            copied = false
            copyBtn.textContent = COPY_LABEL
          }, COPIED_MS)
        })
      })
    }
  }

  render()
  return container
}
