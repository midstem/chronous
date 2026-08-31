import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import { highlight } from '../highlight'

import { COPIED_LABEL, COPIED_MS, COPY_LABEL, TOKEN_STYLES } from './constants'

type CodeProps = {
  fileName: string
  badge: string
  hint: string
  source: string
}

export const Code = ({
  fileName,
  badge,
  hint,
  source
}: CodeProps): ReactElement => {
  const [copied, setCopied] = useState(false)
  const tokens = useMemo(() => highlight(source), [source])

  const copy = (): void => {
    void navigator.clipboard.writeText(source).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <header className="flex flex-wrap items-center gap-3 pb-3">
        <h2 className="font-mono text-lg font-semibold">{fileName}</h2>
        <span className="font-mono text-[11px] text-faint">{badge}</span>
        <button type="button" className="ghost-button ml-auto" onClick={copy}>
          {copied ? COPIED_LABEL : COPY_LABEL}
        </button>
      </header>

      <section className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-5 text-code-plain">
          {tokens.map((token, index) => (
            <span key={index} className={TOKEN_STYLES[token.kind]}>
              {token.text}
            </span>
          ))}
        </pre>
      </section>

      <p className="pt-2 text-[11px] leading-4 text-muted">{hint}</p>
    </div>
  )
}
