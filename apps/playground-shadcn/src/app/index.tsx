import { useMemo, useState, type ReactElement } from 'react'

import { CodePanel } from '@/code'
import { INSTALL_COMMAND } from '@/code/constants'
import { Button } from '@/components/ui/button'
import { ChronousCalendar } from '@/components/ui/chronous-calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CopyButton } from '@/copy-button'
import { DocsSection } from '@/docs'
import { DOCS_HOME_URL } from '@/docs/constants'
import { demoEvents } from '@/events'
import { Settings, readSettings, todayIn } from '@/settings'
import { ThemeToggle } from '@/theme'

import { PLAYGROUNDS_URL } from './constants'

const INITIAL = readSettings(window.location.search)

export const App = (): ReactElement => {
  const [locale, setLocale] = useState(INITIAL.locale)
  const [timeZone, setTimeZone] = useState(INITIAL.timeZone)
  const events = useMemo(
    () =>
      INITIAL.withEvents ? demoEvents(INITIAL.date ?? todayIn(timeZone)) : [],
    [timeZone]
  )

  return (
    <div data-app className="bg-background text-foreground min-h-svh">
      <header data-embed-hidden className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a
            href={PLAYGROUNDS_URL}
            className="font-semibold tracking-tight whitespace-nowrap"
          >
            Chronous
            <span className="text-muted-foreground font-normal"> / shadcn</span>
          </a>
          <nav className="flex items-center gap-1">
            <Button asChild size="sm" variant="ghost">
              <a href={DOCS_HOME_URL}>Docs</a>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <a href={PLAYGROUNDS_URL}>All playgrounds</a>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 embed:max-w-none embed:p-4 embed:sm:p-6">
        <section data-embed-hidden className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Chronous Calendar for shadcn/ui
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Day, week, month and agenda views in one editable file. It lands in
            your <code>components/ui</code>, uses your <code>Button</code> and
            follows your theme tokens, light and dark.
          </p>
          <div className="bg-muted/40 flex max-w-full items-center gap-2 self-start rounded-lg border py-1 pr-1 pl-3 font-mono text-sm">
            <code className="truncate">{INSTALL_COMMAND}</code>
            <CopyButton label="Copy install command" value={INSTALL_COMMAND} />
          </div>
        </section>
        <DocsSection />
        <Tabs defaultValue="preview" className="gap-6">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent
            forceMount
            value="preview"
            className="flex flex-col gap-6 data-[state=inactive]:hidden"
          >
            <Settings
              locale={locale}
              timeZone={timeZone}
              onLocale={setLocale}
              onTimeZone={setTimeZone}
            />
            <ChronousCalendar
              events={events}
              locale={locale}
              timeZone={timeZone}
              defaultDate={INITIAL.date}
              defaultView={INITIAL.view}
            />
          </TabsContent>
          <TabsContent value="code">
            <CodePanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
