import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import { MONTH_VIEW, SLOTTED_VIEWS } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { preambleOf } from './preamble'

const SIMPLE_OPENING: readonly string[] = [
  '@Component({',
  "  selector: 'app-board',",
  '  standalone: true,',
  '  imports: [CALENDAR_DIRECTIVES],',
  '  template: `',
  '    <div',
  '      *chronousCalendar="range(); events: events(); locale: LOCALE"',
  '      class="h-full overflow-auto bg-white p-4 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"',
  '    >'
]

const SIMPLE_CLOSING: readonly string[] = [
  '    </div>',
  '  `',
  '})',
  'export class BoardComponent {',
  '  readonly range = signal<CalendarRange>(INITIAL_RANGE)',
  '  readonly events = signal<EventInput<EventData>[]>(EVENTS)',
  '}'
]

const SLOTTED_BODY = (hourHeight: number): readonly string[] => [
  '      <div class="sticky top-0 z-10 bg-white dark:bg-zinc-900">',
  '        <div chronousHeader class="border-b border-zinc-200 dark:border-zinc-700">',
  '          <div></div>',
  '          <div',
  '            *chronousDayHeadings="let day; let weekdayLabel = weekdayLabel; let dayLabel = dayLabel"',
  '            class="border-l border-zinc-100 py-2 text-center text-sm font-medium dark:border-zinc-800"',
  '          >',
  '            {{ weekdayLabel }} {{ dayLabel }}',
  '          </div>',
  '        </div>',
  '',
  '        <chronous-all-day-row class="border-b border-zinc-200 dark:border-zinc-700">',
  '          <span chronousGutterCell class="pl-2 text-[10px] text-zinc-400">all-day</span>',
  '          <div',
  '            *chronousAllDayEvents="let event"',
  '            class="truncate rounded bg-purple-600 px-2 text-[11px] leading-6 text-white dark:bg-purple-900"',
  '          >',
  '            {{ event.data.title }}',
  '          </div>',
  '        </chronous-all-day-row>',
  '      </div>',
  '',
  `      <chronous-time-grid [hourHeight]="${hourHeight}">`,
  '        <div chronousTimeAxis>',
  '          <div *chronousTimeLabels="let slot; let timeLabel = timeLabel" class="right-2 text-[10px] text-zinc-400">',
  '            {{ timeLabel }}',
  '          </div>',
  '        </div>',
  '',
  '        <div *chronousDayColumns="let day" class="border-l border-zinc-100 dark:border-zinc-800">',
  '          <span *chronousTimeSlots="day" class="border-t border-zinc-100 dark:border-zinc-800"></span>',
  '',
  '          <div',
  '            *chronousTimedEvents="day; let event"',
  '            class="truncate rounded-md bg-blue-600 px-1.5 text-[11px] leading-[1.35] font-medium text-white dark:bg-blue-900"',
  '          >',
  '            {{ event.data.title }}',
  '          </div>',
  '        </div>',
  '      </chronous-time-grid>'
]

const MONTH_BODY: readonly string[] = [
  '      <div chronousMonthGrid>',
  '        <div *chronousMonthRows="let row; laneHeight: 20" class="border-b border-zinc-200 last:border-b-0 dark:border-zinc-700">',
  '          <div',
  '            *chronousMonthDays="row; let day; let dayLabel = dayLabel; let lanes = lanes"',
  '            class="min-h-28 border-l border-zinc-100 p-1 first:border-l-0 dark:border-zinc-800"',
  '          >',
  '            <div class="h-7 text-center text-xs font-medium">{{ dayLabel }}</div>',
  '            <div [style.height.px]="lanes * 20"></div>',
  '            <div',
  '              *chronousMonthTimedEvents="day; let event"',
  '              class="truncate rounded bg-blue-600 px-1 text-[11px] leading-5 text-white dark:bg-blue-900"',
  '            >',
  '              {{ event.data.title }}',
  '            </div>',
  '          </div>',
  '',
  '          <div',
  '            *chronousMonthAllDayEvents="row; let event"',
  '            class="truncate rounded bg-purple-600 px-1.5 text-[11px] leading-5 text-white dark:bg-purple-900"',
  '          >',
  '            {{ event.data.title }}',
  '          </div>',
  '        </div>',
  '      </div>'
]

const AGENDA_BODY: readonly string[] = [
  '      <ul chronousAgendaList class="divide-y divide-zinc-100 dark:divide-zinc-800">',
  '        <li *chronousAgendaDays="let day; let dayLabel = dayLabel; let weekdayLabel = weekdayLabel; let bars = bars" class="flex gap-4 px-4 py-3">',
  '          <span class="w-16 shrink-0 text-sm font-semibold">{{ weekdayLabel }} {{ dayLabel }}</span>',
  '          <span class="flex flex-col gap-1">',
  '            <span *chronousAgendaAllDayEvents="bars; let event" class="text-[13px]">',
  '              {{ event.data.title }} · all-day',
  '            </span>',
  '            <span *chronousAgendaTimedEvents="day; let event; let timeRangeLabel = timeRangeLabel" class="text-[13px]">',
  '              {{ event.data.title }} · {{ timeRangeLabel }}',
  '            </span>',
  '          </span>',
  '        </li>',
  '      </ul>'
]

export const simpleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  hourHeight: number
): string => {
  const body = SLOTTED_VIEWS.includes(range.view)
    ? SLOTTED_BODY(hourHeight)
    : range.view === MONTH_VIEW
      ? MONTH_BODY
      : AGENDA_BODY

  return [
    ...preambleOf(range, events, locale, { tones: false, clock: false }),
    ...SIMPLE_OPENING,
    ...body,
    ...SIMPLE_CLOSING
  ].join('\n')
}
