import { ArrowRightIcon } from 'lucide-react'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'

import { DOCS_HOME_URL, DOCS_LINKS } from './constants'

export const DocsSection = (): ReactElement => (
  <section
    data-embed-hidden
    aria-labelledby="docs-heading"
    className="flex flex-col gap-5 rounded-xl border p-5 sm:p-6"
  >
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Documentation
      </span>
      <h2
        id="docs-heading"
        className="text-xl font-semibold tracking-tight sm:text-2xl"
      >
        Everything the calendar does, written down
      </h2>
      <p className="text-muted-foreground max-w-2xl text-sm">
        Guides that explain the reasoning, an API reference for every prop and
        examples running live on the page — with the file and the stylesheet
        that produced each one.
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {DOCS_LINKS.map(({ title, href, description }) => (
        <a
          key={title}
          href={href}
          className="hover:bg-muted/50 focus-visible:ring-ring/50 flex flex-col gap-1.5 rounded-lg border p-4 transition-colors outline-none focus-visible:ring-3"
        >
          <span className="text-sm font-medium">{title}</span>
          <span className="text-muted-foreground text-sm">{description}</span>
        </a>
      ))}
    </div>
    <Button asChild variant="outline" className="self-start">
      <a href={DOCS_HOME_URL}>
        Browse documentation
        <ArrowRightIcon data-icon="inline-end" />
      </a>
    </Button>
  </section>
)
