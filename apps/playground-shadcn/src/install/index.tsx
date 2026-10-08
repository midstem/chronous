import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'

import { COPIED_MS, INSTALL_COMMAND } from './constants'

export const InstallCommand = (): ReactElement => {
  const [copied, setCopied] = useState(false)

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="bg-muted/40 flex max-w-full items-center gap-2 self-start rounded-lg border py-1 pr-1 pl-3 font-mono text-sm">
      <code className="truncate">{INSTALL_COMMAND}</code>
      <Button
        aria-label="Copy install command"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => void copy()}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  )
}
