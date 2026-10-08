import { useMemo, useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { ChronousCalendar } from '@/components/ui/chronous-calendar'
import { demoEvents } from '@/events'
import { InstallCommand } from '@/install'
import { Settings, readSettings, todayIn } from '@/settings'
import { ThemeToggle } from '@/theme'

import { DOCS_URL, PLAYGROUNDS_URL } from './constants'

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
    <div className="bg-background text-foreground min-h-svh">
      <header className="border-b">
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
              <a href={DOCS_URL}>Docs</a>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <a href={PLAYGROUNDS_URL}>All playgrounds</a>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Chronous Calendar for shadcn/ui
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Day, week, month and agenda views in one editable file. It lands in
            your <code>components/ui</code>, uses your <code>Button</code> and
            follows your theme tokens, light and dark.
          </p>
          <InstallCommand />
        </section>
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
      </main>
    </div>
  )
}
