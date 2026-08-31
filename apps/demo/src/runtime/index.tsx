import { useId, useRef } from 'react'
import type { MouseEvent, ReactElement } from 'react'

import {
  BASELINE_NOTE,
  CLOSE_LABEL,
  COPY,
  DIALOG_TITLE,
  DOCS_LABEL,
  DOCS_URL,
  SUPPORT,
  SUPPORT_TITLE
} from './constants'
import { runtimeState } from './helpers'

const dismissed = (
  event: MouseEvent<HTMLDialogElement>,
  dialog: HTMLDialogElement
): boolean => event.target === dialog

export const Runtime = (): ReactElement => {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const copy = COPY[runtimeState()]

  return (
    <>
      <button
        type="button"
        title={copy.summary}
        aria-haspopup="dialog"
        className="rounded-full border border-line bg-raised px-2.5 py-1 font-mono text-[11px] text-muted hover:border-line hover:text-ink"
        onClick={() => dialog.current?.showModal()}
      >
        {copy.badge}
      </button>

      <dialog
        ref={dialog}
        closedby="any"
        aria-labelledby={titleId}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/50"
        onClick={(event) => {
          if (dialog.current && dismissed(event, dialog.current))
            dialog.current.close()
        }}
      >
        <div className="flex flex-col gap-3 p-4">
          <h2 id={titleId} className="text-sm font-semibold">
            {DIALOG_TITLE}
          </h2>

          <p className="font-mono text-[11px] text-accent">{copy.badge}</p>

          <p className="text-[13px] leading-5">{copy.detail}</p>

          <section className="flex flex-col gap-1.5 rounded-lg bg-sunken p-3">
            <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              {SUPPORT_TITLE}
            </h3>

            <ul className="flex flex-col gap-1">
              {SUPPORT.map((row) => (
                <li
                  key={row.browser}
                  className="flex items-baseline justify-between gap-3 text-[12px]"
                >
                  <span>{row.browser}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono tabular-nums">{row.since}</span>
                    <span className="text-[11px] text-faint">{row.when}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="pt-1 text-[11px] leading-4 text-muted">
              {BASELINE_NOTE}
            </p>
          </section>

          <div className="flex items-center justify-between gap-3">
            <a
              className="text-[12px] text-accent underline underline-offset-2"
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
            >
              {DOCS_LABEL}
            </a>

            <button
              type="button"
              className="ghost-button"
              onClick={() => dialog.current?.close()}
            >
              {CLOSE_LABEL}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export { installTemporal } from './helpers'
