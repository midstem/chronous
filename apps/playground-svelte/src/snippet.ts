import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-svelte'
import {
  ALL_DAY_LANE_HEIGHT,
  BOX_GAP,
  JSON_INDENT,
  MIN_BOX_HEIGHT,
  MONTH_LANE_HEIGHT,
  MONTH_VIEW,
  SLOTTED_VIEWS
} from '@midstem/playground-core'
import type { EventData, Style } from '@midstem/playground-core'

const quote = (value: string): string =>
  JSON.stringify(value).replace(/</g, '\\u003c')

const serialized = (value: unknown): string =>
  JSON.stringify(value, null, JSON_INDENT).replace(/</g, '\\u003c')

/** Build a standalone, pasteable Svelte component for the current board. */
export const snippetOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number,
  style: Style = 'default'
): string => {
  const plain = style === 'simple'
  const slotted = SLOTTED_VIEWS.includes(range.view)
  const month = range.view === MONTH_VIEW
  const toolbar = plain
    ? []
    : [
        '  <C.Toolbar onNavigate={navigate} {views}>',
        '    {#snippet children({ navigation, title, goTo, range: shown })}',
        '      <header class="flex flex-wrap items-center gap-3 pb-3">',
        '        <div class="flex items-center gap-1"><button class="rounded border px-2 py-1" disabled={!navigation.prev} onclick={() => navigation.prev && goTo(navigation.prev)}>‹</button><button class="rounded border px-2 py-1" disabled={!navigation.today} onclick={() => navigation.today && goTo(navigation.today())}>Today</button><button class="rounded border px-2 py-1" disabled={!navigation.next} onclick={() => navigation.next && goTo(navigation.next)}>›</button></div>',
        '        <h2 class="mr-auto text-lg font-semibold">{title}</h2>',
        '        {#each views as view (view)}<button class="rounded border px-2 py-1 capitalize" aria-pressed={view === shown.view} onclick={() => goTo(navigation.withView(view))}>{view}</button>{/each}',
        '      </header>',
        '    {/snippet}',
        '  </C.Toolbar>'
      ]

  const slottedBody = plain
    ? [
        '  <C.Header><C.DayHeadings /></C.Header>',
        `  <C.AllDayRow laneHeight={${ALL_DAY_LANE_HEIGHT}}><C.AllDayEvents /></C.AllDayRow>`,
        `  <C.TimeGrid hourHeight={${hourHeight}} scrollToHour={7}>`,
        '    <C.TimeAxis><C.TimeLabels /></C.TimeAxis>',
        '    <C.DayColumns><C.TimeSlots /><C.TimedEvents>{#snippet children({ event })}{event.data?.title ?? event.id}{/snippet}</C.TimedEvents><C.NowMarker /></C.DayColumns>',
        '  </C.TimeGrid>'
      ]
    : [
        '  <div class="sticky top-0 z-20 bg-white dark:bg-slate-950"><C.Header class="border-b border-slate-200 dark:border-white/15"><C.DayHeadings class="border-l border-slate-100 py-2 dark:border-white/5">{#snippet children({ weekdayLabel, dayLabel })}<div class="flex flex-col items-center"><span class="text-xs text-slate-500">{weekdayLabel}</span><strong>{dayLabel}</strong></div>{/snippet}</C.DayHeadings></C.Header>',
        `    <C.AllDayRow laneHeight={${ALL_DAY_LANE_HEIGHT}} class="border-b border-slate-200 dark:border-white/15"><C.AllDayEvents>{#snippet children({ event })}<span class="block h-full truncate rounded bg-blue-700 px-2 text-xs text-white dark:bg-blue-300 dark:text-slate-950">{event.data?.title ?? event.id}</span>{/snippet}</C.AllDayEvents></C.AllDayRow>`,
        '  </div>',
        `  <C.TimeGrid hourHeight={${hourHeight}} scrollToHour={7}>`,
        '    <C.TimeAxis><C.TimeLabels class="right-2 text-xs text-slate-400" /></C.TimeAxis>',
        '    <C.DayColumns class="border-l border-slate-100 dark:border-white/5"><C.TimeSlots class="border-t border-slate-100 dark:border-white/5" /><C.NowMarker class="border-t-2 border-orange-400" />',
        `      <C.TimedEvents minHeight={${MIN_BOX_HEIGHT}} gap={${BOX_GAP}}>{#snippet children({ event })}<article class="h-full overflow-hidden rounded border border-white bg-violet-700 px-2 py-1 text-xs text-white shadow dark:border-slate-950 dark:bg-violet-400 dark:text-slate-950">{event.data?.title ?? event.id}</article>{/snippet}</C.TimedEvents>`,
        '    </C.DayColumns>',
        '  </C.TimeGrid>'
      ]

  const monthBody = plain
    ? [
        '  <C.MonthGrid><C.MonthWeekdays />',
        `    <C.MonthRows laneHeight={${MONTH_LANE_HEIGHT}}><C.MonthDays>{#snippet children({ dayLabel })}<span>{dayLabel}</span><C.MonthTimedEvents>{#snippet children({ event })}{event.data?.title ?? event.id}{/snippet}</C.MonthTimedEvents>{/snippet}</C.MonthDays><C.MonthAllDayEvents /></C.MonthRows>`,
        '  </C.MonthGrid>'
      ]
    : [
        '  <C.MonthGrid><div class="grid grid-cols-7 border-b border-slate-200 dark:border-white/15"><C.MonthWeekdays class="py-2 text-center text-xs uppercase text-slate-500" /></div>',
        `    <C.MonthRows laneHeight={${MONTH_LANE_HEIGHT}} class="border-b border-slate-200 dark:border-white/15"><C.MonthDays class="flex flex-col border-l border-slate-100 p-1 dark:border-white/5">{#snippet children({ dayLabel, lanes })}<span class="text-center text-xs">{dayLabel}</span><span style={\`height:\${lanes * ${MONTH_LANE_HEIGHT}}px\`}></span><C.MonthTimedEvents class="truncate rounded px-1 text-xs bg-violet-700 text-white dark:bg-violet-400 dark:text-slate-950">{#snippet children({ event })}<span class="block truncate">{event.data?.title ?? event.id}</span>{/snippet}</C.MonthTimedEvents>{/snippet}</C.MonthDays><C.MonthAllDayEvents>{#snippet children({ event })}<span class="block h-full truncate rounded bg-blue-700 px-1 text-xs text-white dark:bg-blue-300 dark:text-slate-950">{event.data?.title ?? event.id}</span>{/snippet}</C.MonthAllDayEvents></C.MonthRows>`,
        '  </C.MonthGrid>'
      ]

  const agendaBody = plain
    ? [
        '  <C.AgendaList><C.AgendaDays showEmptyDays>{#snippet children({ weekdayLabel, dayLabel })}<section><h2>{weekdayLabel} {dayLabel}</h2><C.AgendaAllDayEvents>{#snippet children({ event })}<p>{event.data?.title ?? event.id}</p>{/snippet}</C.AgendaAllDayEvents><C.AgendaTimedEvents>{#snippet children({ event, timeRangeLabel })}<p>{timeRangeLabel}: {event.data?.title ?? event.id}</p>{/snippet}</C.AgendaTimedEvents></section>{/snippet}</C.AgendaDays></C.AgendaList>'
      ]
    : [
        '  <C.AgendaList class="divide-y divide-slate-200 dark:divide-white/5"><C.AgendaDays showEmptyDays class="grid grid-cols-[88px_1fr] gap-4 px-4 py-3">{#snippet children({ weekdayLabel, dayLabel, bars, boxes })}<div class="text-sm font-semibold">{weekdayLabel} {dayLabel}</div><div class="flex flex-col gap-1">{#if !bars.length && !boxes.length}<span class="text-sm text-slate-400">Nothing on this day</span>{/if}<C.AgendaAllDayEvents class="text-sm">{#snippet children({ event })}<p>{event.data?.title ?? event.id}</p>{/snippet}</C.AgendaAllDayEvents><C.AgendaTimedEvents class="text-sm">{#snippet children({ event, timeRangeLabel })}<p><span class="mr-3 font-mono text-xs">{timeRangeLabel}</span>{event.data?.title ?? event.id}</p>{/snippet}</C.AgendaTimedEvents></div>{/snippet}</C.AgendaDays></C.AgendaList>'
      ]

  const body = plain
    ? slotted
      ? slottedBody
      : month
        ? monthBody
        : agendaBody
    : [
        "  {#if ['day', 'week', 'days'].includes(range.view)}",
        ...slottedBody,
        "  {:else if range.view === 'month'}",
        ...monthBody,
        '  {:else}',
        ...agendaBody,
        '  {/if}'
      ]
  const rangeLines = Object.entries(range)
    .map(
      ([key, value]) =>
        `    ${key}: ${typeof value === 'string' ? quote(value) : String(value)}`
    )
    .join(',\n')

  return [
    '<script lang="ts">',
    "  import 'temporal-polyfill/global'",
    "  import { createCalendarComponents } from '@midstem/chronous-svelte'",
    `  import type { CalendarRange, EventInput${plain ? '' : ', ViewKind'} } from '@midstem/chronous-svelte'`,
    '',
    '  type EventData = { title?: string }',
    '  const C = createCalendarComponents<EventData>()',
    `  const locale = ${quote(locale)}`,
    ...(plain
      ? []
      : [
          "  const views: ViewKind[] = ['day', 'week', 'days', 'month', 'agenda']"
        ]),
    '  const initialRange: CalendarRange = {',
    rangeLines,
    '  }',
    `  const events: EventInput<EventData>[] = ${serialized(events)}`,
    ...(plain
      ? ['  const range = initialRange']
      : [
          '  let range = $state<CalendarRange>(initialRange)',
          '  const navigate = (next: CalendarRange) => (range = next)'
        ]),
    '</script>',
    '',
    '<C.Root {range} {events} {locale} class="flex h-full flex-col overflow-auto bg-white p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-200">',
    '  {#snippet renderError(error)}<p role="alert">{error.name}: {error.message}</p>{/snippet}',
    ...toolbar,
    ...body,
    '</C.Root>',
    ''
  ].join('\n')
}
