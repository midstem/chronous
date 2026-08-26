import type { ReactElement, ReactNode } from 'react'

type PanelProps = {
  title: string
  badge?: string
  children: ReactNode
}

export const Panel = ({ title, badge, children }: PanelProps): ReactElement => (
  <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3">
    <h2 className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-semibold">
      {title}
      {badge && (
        <span className="font-mono text-[10px] font-normal text-faint">
          {badge}
        </span>
      )}
    </h2>
    {children}
  </section>
)
