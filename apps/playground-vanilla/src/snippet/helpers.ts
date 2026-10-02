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
  const month = range.view === MONTH_VIEW
  const preamble = preambleOf(range, events, locale, {
    clock: slotted,
    now: true
  })
  const helpers = slotted
    ? slottedHelpers(hourHeight)
    : month
      ? MONTH_HELPERS
      : []
  const renderer = slotted
    ? SLOTTED_RENDER
    : month
      ? MONTH_RENDER
      : AGENDA_RENDER
  const renderView = slotted
    ? 'renderSlotted(calendar, now)'
    : month
      ? 'renderMonth(calendar, now)'
      : 'renderAgenda(calendar, now)'
  const scrollOnRender = slotted
    ? [
        '      scroller.scrollTop = preserveScroll && previousScrollTop !== undefined',
        '        ? previousScrollTop',
        '        : HOUR_HEIGHT * SCROLL_TO_HOUR'
      ]
    : [
        '      if (preserveScroll && previousScrollTop !== undefined) {',
        '        scroller.scrollTop = previousScrollTop',
        '      }'
      ]
  const titleHelper = [
    'const titleFor = (calendar) => {',
    ...(range.view === 'day' || month
      ? [
          '  const anchor = calendar.days.find((day) => day.inCurrentPeriod)?.date ?? calendar.days[0]?.date ?? INITIAL_RANGE.currentDate'
        ]
      : []),
    ...(range.view === 'day'
      ? [
          '  return formatIso(anchor, {',
          '    locale: LOCALE,',
          '    options: { day: "numeric", month: "long", year: "numeric" }',
          '  })'
        ]
      : month
        ? [
            '  return formatIso(anchor, { locale: LOCALE, options: { month: "long", year: "numeric" } })'
          ]
        : [
            '  const first = formatIso(calendar.days[0].date, {',
            '    locale: LOCALE,',
            '    options: { day: "numeric", month: "short" }',
            '  })',
            '  const last = formatIso(calendar.days[calendar.days.length - 1].date, {',
            '    locale: LOCALE,',
            '    options: { day: "numeric", month: "long", year: "numeric" }',
            '  })',
            '  return `${first} – ${last}`'
          ]),
    '}'
  ]
  const main = [
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
    '    const heading = titleFor(calendar)',
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
    '        </header>',
    '        <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/15 dark:bg-slate-950">',
    '          <div class="min-h-0 flex-1 overflow-auto" data-scroller>',
    '            ${' + renderView + '}',
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
    '    const scroller = container.querySelector("[data-scroller]")',
    '    if (scroller) {',
    ...scrollOnRender,
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
  ]

  return [...preamble, ...helpers, ...renderer, ...titleHelper, ...main].join(
    '\n'
  )
}
