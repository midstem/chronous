import type { CalendarRange, EventInput, LocaleId } from '@midstem/chronous-vue'
import { MONTH_VIEW, SLOTTED_VIEWS } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { eventLines, rangeLines } from './preamble'

const simplePreambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  helperConstants: readonly string[]
): readonly string[] => [
  '<script setup lang="ts">',
  "import { Calendar } from '@midstem/chronous-vue'",
  "import type { CalendarRange, EventInput } from '@midstem/chronous-vue'",
  '',
  'type EventData = { title: string }',
  '',
  `const LOCALE = '${locale}'`,
  '',
  ...helperConstants,
  'const RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  '</script>',
  ''
]

const SIMPLE_OPENING: readonly string[] = [
  '<template>',
  '  <Calendar.Root',
  '    :range="RANGE"',
  '    :events="EVENTS"',
  '    :locale="LOCALE"',
  '    class="h-full overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"',
  '  >'
]

const SIMPLE_CLOSING: readonly string[] = ['  </Calendar.Root>', '</template>']

const SLOTTED_BODY: readonly string[] = [
  '    <div class="sticky top-0 z-10 bg-white dark:bg-zinc-900">',
  '      <Calendar.Header class="border-b border-zinc-200 dark:border-zinc-700">',
  '        <Calendar.DayHeadings class="border-l border-zinc-100 py-2 text-center text-sm font-medium dark:border-zinc-800" />',
  '      </Calendar.Header>',
  '',
  '      <Calendar.AllDayRow class="border-b border-zinc-200 dark:border-zinc-700">',
  '        <template #gutterCell>',
  '          <span class="pl-2 text-[10px] text-zinc-400">all-day</span>',
  '        </template>',
  '        <Calendar.AllDayEvents',
  '          class="truncate rounded bg-violet-700 px-2 text-[11px] leading-6 text-white"',
  '          v-slot="{ event }"',
  '        >',
  '          {{ event.data?.title }}',
  '        </Calendar.AllDayEvents>',
  '      </Calendar.AllDayRow>',
  '    </div>',
  '',
  '    <Calendar.TimeGrid :hour-height="HOUR_HEIGHT">',
  '      <Calendar.TimeAxis>',
  '        <Calendar.TimeLabels class="right-2 text-[10px] text-zinc-400" />',
  '      </Calendar.TimeAxis>',
  '',
  '      <Calendar.DayColumns class="border-l border-zinc-100 dark:border-zinc-800">',
  '        <Calendar.TimeSlots class="border-t border-zinc-100 dark:border-zinc-800" />',
  '',
  '        <Calendar.TimedEvents',
  '          class="truncate rounded-md bg-blue-700 px-1.5 text-[11px] leading-[1.35] font-medium text-white"',
  '          v-slot="{ event }"',
  '        >',
  '          {{ event.data?.title }}',
  '        </Calendar.TimedEvents>',
  '      </Calendar.DayColumns>',
  '    </Calendar.TimeGrid>'
]

const MONTH_BODY: readonly string[] = [
  '    <Calendar.MonthGrid>',
  '      <Calendar.MonthRows',
  '        class="border-b border-zinc-200 last:border-b-0 dark:border-zinc-700"',
  '        :lane-height="LANE_HEIGHT"',
  '      >',
  '        <Calendar.MonthDays',
  '          class="min-h-28 border-l border-zinc-100 p-1 first:border-l-0 dark:border-zinc-800 data-[in-current-period=false]:bg-zinc-50 data-[in-current-period=false]:text-zinc-400"',
  '          v-slot="{ dayLabel, lanes }"',
  '        >',
  '          <div class="h-7 text-center text-xs font-medium">',
  '            {{ dayLabel }}',
  '          </div>',
  '          <div :style="{ height: `${lanes * LANE_HEIGHT}px` }" />',
  '          <Calendar.MonthTimedEvents',
  '            class="truncate rounded bg-blue-700 px-1 text-[11px] leading-5 text-white"',
  '            v-slot="{ event }"',
  '          >',
  '            {{ event.data?.title }}',
  '          </Calendar.MonthTimedEvents>',
  '        </Calendar.MonthDays>',
  '',
  '        <Calendar.MonthAllDayEvents',
  '          class="truncate rounded bg-violet-700 px-1.5 text-[11px] leading-5 text-white"',
  '          v-slot="{ event }"',
  '        >',
  '          {{ event.data?.title }}',
  '        </Calendar.MonthAllDayEvents>',
  '      </Calendar.MonthRows>',
  '    </Calendar.MonthGrid>'
]

const AGENDA_BODY: readonly string[] = [
  '    <Calendar.AgendaList as="ul" class="divide-y divide-zinc-100 dark:divide-zinc-800">',
  '      <Calendar.AgendaDays as="li" class="flex gap-4 px-4 py-3" v-slot="{ dayLabel, weekdayLabel }">',
  '        <span class="w-16 shrink-0 text-sm font-semibold">',
  '          {{ weekdayLabel }} {{ dayLabel }}',
  '        </span>',
  '',
  '        <span class="flex flex-col gap-1">',
  '          <Calendar.AgendaAllDayEvents as="span" class="text-[13px]" v-slot="{ event }">',
  '            {{ event.data?.title }} · all-day',
  '          </Calendar.AgendaAllDayEvents>',
  '',
  '          <Calendar.AgendaTimedEvents as="span" class="text-[13px]" v-slot="{ event, timeRangeLabel }">',
  '            {{ event.data?.title }} · {{ timeRangeLabel }}',
  '          </Calendar.AgendaTimedEvents>',
  '        </span>',
  '      </Calendar.AgendaDays>',
  '    </Calendar.AgendaList>'
]

export const simpleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const isSlotted = SLOTTED_VIEWS.includes(range.view)
  const isMonth = range.view === MONTH_VIEW

  const helpers = isSlotted
    ? [`const HOUR_HEIGHT = ${hourHeight}`, '']
    : isMonth
      ? ['const LANE_HEIGHT = 20', '']
      : []

  const body = isSlotted ? SLOTTED_BODY : isMonth ? MONTH_BODY : AGENDA_BODY

  return [
    ...simplePreambleOf(range, events, locale, helpers),
    ...SIMPLE_OPENING,
    ...body,
    ...SIMPLE_CLOSING
  ].join('\n')
}
