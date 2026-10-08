import { useMemo, type ReactElement } from 'react'
import { highlight } from 'sugar-high'

import { CopyButton } from '@/copy-button'
import { cn } from '@/lib/utils'

type CodeBlockProps = {
  code: string
  fileName?: string
  language?: 'tsx' | 'bash'
  className?: string
}

export const CodeBlock = ({
  code,
  fileName,
  language = 'tsx',
  className
}: CodeBlockProps): ReactElement => {
  const html = useMemo(
    () => (language === 'tsx' ? highlight(code) : null),
    [code, language]
  )

  return (
    <figure
      className={cn(
        'bg-muted/40 min-w-0 overflow-hidden rounded-lg border',
        className
      )}
    >
      {fileName && (
        <figcaption className="text-muted-foreground flex items-center justify-between gap-2 border-b py-1 pr-1 pl-4 font-mono text-xs">
          <span className="truncate">{fileName}</span>
          <CopyButton label={`Copy ${fileName}`} value={code} />
        </figcaption>
      )}
      <div className="relative">
        <pre className="max-h-[480px] overflow-auto p-4 pr-12 font-mono text-[13px] leading-relaxed">
          {html === null ? (
            <code>{code}</code>
          ) : (
            <code dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </pre>
        {!fileName && (
          <CopyButton className="absolute top-2 right-2" value={code} />
        )}
      </div>
    </figure>
  )
}
