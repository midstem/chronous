export const PLAYGROUND_STYLES = {
  panel: 'flex flex-col gap-3 rounded-lg border border-line bg-surface p-3',
  panelTitle:
    'flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-semibold',
  panelBadge: 'font-mono text-[10px] font-normal text-faint',
  fieldFrame: 'flex flex-col gap-1',
  fieldLabel: 'font-mono text-xs font-semibold tracking-tight text-ink',
  fieldLabelHidden: 'sr-only',
  fieldControl: 'field-control',
  fieldHint: 'text-[11px] leading-4 text-muted',
  ghostButton: 'ghost-button'
} as const
