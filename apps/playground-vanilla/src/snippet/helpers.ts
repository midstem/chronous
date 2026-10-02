import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous'
import type { EventData } from '@midstem/playground-core'

import { AGENDA_RENDER } from './agenda'
import { MONTH_HELPERS, MONTH_RENDER } from './month'
import { preambleOf } from './preamble'
import { SLOTTED_RENDER, slottedHelpers } from './slotted'

export { simpleOf } from './simple'

export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const needs = { clock: true }
  const preamble = preambleOf(range, events, locale, needs)

  const helpers = [...slottedHelpers(hourHeight), ...MONTH_HELPERS]
  const viewRender = [...SLOTTED_RENDER, ...MONTH_RENDER, ...AGENDA_RENDER]

  const mainRunner = [
    'export const renderCalendar = (container) => {',
    '  let currentRange = { ...INITIAL_RANGE }',
    '',
    '  const render = (preserveScroll = false) => {',
    '    const previousScrollTop = preserveScroll',
    '      ? container.querySelector("[data-scroller]")?.scrollTop',
    '      : undefined',
    '    let calendar',
    '    try { calendar = buildCalendar(currentRange, EVENTS) } catch (error) {',
    '      const failure = error instanceof Error ? error : new Error(String(error))',
    '      container.innerHTML = `<p role="alert" class="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><strong>${escapeHtml(failure.name)}</strong>: ${escapeHtml(failure.message)}</p>`',
    '      return',
    '    }',
    '    const now = getNow(currentRange.timeZone)',
    '    const state = initialCalendarState(currentRange)',
    '    const nextRange = calendarReducer(state, { type: "next" }).range',
    '    const prevRange = calendarReducer(state, { type: "prev" }).range',
    '    const heading = titleFor(calendar, currentRange)',
    '',
    '    container.innerHTML = `',
    '      <div class="flex h-full flex-col p-4 text-slate-900 dark:text-slate-200">',
    '        <header class="flex flex-wrap items-center gap-3 pb-3">',
    '          <div class="flex items-center gap-1">',
    '            <button type="button" aria-label="Previous period" class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm dark:border-white/15 dark:bg-slate-950" data-nav="prev">‹</button>',
    '            <button type="button" class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm dark:border-white/15 dark:bg-slate-950" data-nav="today">Today</button>',
    '            <button type="button" aria-label="Next period" class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm dark:border-white/15 dark:bg-slate-950" data-nav="next">›</button>',
    '          </div>',
    '          <h2 class="mr-auto truncate text-lg font-semibold">${escapeHtml(heading)}</h2>',
    '          <div class="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 dark:border-white/15 dark:bg-slate-950">',
    '            ${VIEWS.map((kind) => `<button type="button" aria-pressed="${kind === currentRange.view}" class="rounded px-2.5 py-1 text-xs font-medium capitalize ${kind === currentRange.view ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}" data-view="${kind}">${kind}</button>`).join("")}',
    '          </div>',
    '        </header>',
    '        <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/15 dark:bg-slate-950">',
    '          <div class="min-h-0 flex-1 overflow-auto" data-scroller>',
    '            ${isSlottedView(currentRange.view) ? renderSlotted(calendar, now) : currentRange.view === "month" ? renderMonth(calendar, now) : renderAgenda(calendar, now)}',
    '          </div>',
    '        </section>',
    '      </div>`',
    '',
    '    container.querySelector("[data-nav=\'prev\']")?.addEventListener("click", () => {',
    '      currentRange = prevRange',
    '      render()',
    '    })',
    '    container.querySelector("[data-nav=\'next\']")?.addEventListener("click", () => {',
    '      currentRange = nextRange',
    '      render()',
    '    })',
    '    container.querySelector("[data-nav=\'today\']")?.addEventListener("click", () => {',
    '      currentRange = calendarReducer(state, { type: "today", now: new Date().toISOString() }).range',
    '      render()',
    '    })',
    '    container.querySelectorAll("button[data-view]").forEach((btn) => {',
    '      btn.addEventListener("click", () => {',
    '        currentRange = calendarReducer(state, { type: "view", view: btn.dataset.view }).range',
    '        render()',
    '      })',
    '    })',
    '    const scroller = container.querySelector("[data-scroller]")',
    '    if (isSlottedView(currentRange.view) && scroller) {',
    '      scroller.scrollTop = preserveScroll && previousScrollTop !== undefined',
    '        ? previousScrollTop',
    '        : HOUR_HEIGHT * SCROLL_TO_HOUR',
    '    }',
    '  }',
    '',
    '  render()',
    '  const clockInterval = setInterval(() => render(true), 30_000)',
    '  return () => clearInterval(clockInterval)',
    '}',
    '',
    'const root = document.querySelector("#root") ?? document.body',
    'root.style.height ||= "100vh"',
    '// Clear this interval when removing the calendar from the page.',
    'const stopCalendarClock = renderCalendar(root)',
    ''
  ].filter(Boolean)

  const navigationHelpers = [
    'const isSlottedView = (view) => view === "day" || view === "week" || view === "days"',
    '',
    'const titleFor = (calendar, range) => {',
    '  const anchor = calendar.days.find((day) => day.inCurrentPeriod)?.date ?? calendar.days[0]?.date ?? range.currentDate',
    '  if (range.view === "day") {',
    '    return formatIso(anchor, {',
    '      locale: LOCALE,',
    '      options: { day: "numeric", month: "long", year: "numeric" }',
    '    })',
    '  }',
    '  if (range.view === "month") {',
    '    return formatIso(anchor, { locale: LOCALE, options: { month: "long", year: "numeric" } })',
    '  }',
    '  const first = formatIso(calendar.days[0].date, {',
    '    locale: LOCALE,',
    '    options: { day: "numeric", month: "short" }',
    '  })',
    '  const last = formatIso(calendar.days[calendar.days.length - 1].date, {',
    '    locale: LOCALE,',
    '    options: { day: "numeric", month: "long", year: "numeric" }',
    '  })',
    '  return `${first} – ${last}`',
    '}'
  ]

  return [
    ...preamble,
    ...helpers,
    ...viewRender,
    ...navigationHelpers,
    ...mainRunner
  ].join('\n')
}
