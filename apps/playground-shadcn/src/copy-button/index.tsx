import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { COPIED_MS } from './constants'

type CopyButtonProps = {
  value: string
  label?: string
  className?: string
}

export const CopyButton = ({
  value,
  label = 'Copy',
  className
}: CopyButtonProps): ReactElement => {
  const [copied, setCopied] = useState(false)

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      aria-label={copied ? 'Copied' : label}
      className={cn('shrink-0', className)}
      size="icon-sm"
      type="button"
      variant="ghost"
      onClick={() => void copy()}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
