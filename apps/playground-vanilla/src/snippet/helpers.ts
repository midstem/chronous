import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous'
import { MONTH_VIEW, isSlotted } from '@midstem/playground-core'
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
  const slotted = isSlotted(range.view)
  const isMonth = range.view === MONTH_VIEW

  const needs = { clock: slotted }
  const preamble = preambleOf(range, events, locale, needs)

  const helpers = slotted
    ? slottedHelpers(hourHeight)
    : isMonth
      ? MONTH_HELPERS
      : []

  const viewRender = slotted
    ? SLOTTED_RENDER
    : isMonth
      ? MONTH_RENDER
      : AGENDA_RENDER

  const mainRunner = [
    'export const renderCalendar = (container: HTMLElement): void => {',
    '  let currentRange: CalendarRange = { ...INITIAL_RANGE }',
    '',
    '  const render = (): void => {',
    '    const calendar = buildCalendar(currentRange, EVENTS)',
    '    const state = initialCalendarState(currentRange)',
    '    const nextRange = calendarReducer(state, { type: "next" }).range',
    '    const prevRange = calendarReducer(state, { type: "prev" }).range',
    '',
    '    container.innerHTML = `',
    '      <div class="flex h-full flex-col p-4 text-slate-900 dark:text-slate-200">',
    '        <header class="flex flex-wrap items-center gap-3 pb-3">',
    '          <div class="flex items-center gap-1">',
    '            <button type="button" class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm dark:border-white/15 dark:bg-slate-950" data-nav="prev">‹</button>',
    '            <button type="button" class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm dark:border-white/15 dark:bg-slate-950" data-nav="today">Today</button>',
    '            <button type="button" class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm dark:border-white/15 dark:bg-slate-950" data-nav="next">›</button>',
    '          </div>',
    '          <h2 class="mr-auto truncate text-lg font-semibold">${currentRange.currentDate}</h2>',
    '          <div class="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 dark:border-white/15 dark:bg-slate-950">',
    '            ${VIEWS.map((kind) => `<button type="button" class="rounded px-2.5 py-1 text-xs font-medium capitalize ${kind === currentRange.view ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}" data-view="${kind}">${kind}</button>`).join("")}',
    '          </div>',
    '        </header>',
    '        <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/15 dark:bg-slate-950">',
    '          ${' +
      (slotted
        ? 'renderSlotted(calendar)'
        : isMonth
          ? 'renderMonth(calendar)'
          : 'renderAgenda(calendar)') +
      '}',
    '        </section>',
    '      </div>`',
    '',
    '    container.querySelector("[data-nav=\'prev\']")?.addEventListener("click", () => { currentRange = prevRange; render(); })',
    '    container.querySelector("[data-nav=\'next\']")?.addEventListener("click", () => { currentRange = nextRange; render(); })',
    '    container.querySelector("[data-nav=\'today\']")?.addEventListener("click", () => {',
    '      currentRange = calendarReducer(state, { type: "today", now: new Date().toISOString() }).range',
    '      render()',
    '    })',
    '    container.querySelectorAll<HTMLButtonElement>("button[data-view]").forEach((btn) => {',
    '      btn.addEventListener("click", () => {',
    '        currentRange = calendarReducer(state, { type: "view", view: btn.dataset.view as ViewKind }).range',
    '        render()',
    '      })',
    '    })',
    slotted
      ? '    const scroller = container.querySelector<HTMLElement>("[data-scroller]"); if (scroller) scroller.scrollTop = HOUR_HEIGHT * SCROLL_TO_HOUR;'
      : '',
    '  }',
    '',
    '  render()',
    '}',
    '',
    'const root = document.querySelector<HTMLElement>("#root") ?? document.body',
    'renderCalendar(root)',
    ''
  ].filter(Boolean)

  return [...preamble, ...helpers, ...viewRender, ...mainRunner].join('\n')
}
