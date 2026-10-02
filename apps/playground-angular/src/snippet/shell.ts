const BUTTON =
  'rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm disabled:opacity-40 dark:border-white/15 dark:bg-slate-950'

export const OPENING: readonly string[] = [
  '@Component({',
  "  selector: 'app-board',",
  '  standalone: true,',
  '  imports: [CALENDAR_DIRECTIVES],',
  '  template: `',
  '    <div',
  '      *chronousCalendar="range(); events: events(); locale: LOCALE; gutterWidth: \'66px\'"',
  '      class="flex h-full flex-col p-4 text-slate-900 dark:text-slate-200"',
  '    >',
  '      <div',
  '        *chronousToolbar="let navigation; let title = title"',
  '        class="flex flex-wrap items-center gap-3 pb-3"',
  '      >',
  '        <div class="flex items-center gap-1">',
  '          <button',
  '            type="button"',
  '            aria-label="Previous period"',
  `            class="${BUTTON}"`,
  '            [disabled]="!navigation.prev"',
  '            (click)="navigation.prev && range.set(navigation.prev)"',
  '          >',
  '            ‹',
  '          </button>',
  '          <button',
  '            type="button"',
  `            class="${BUTTON}"`,
  '            [disabled]="!navigation.today"',
  '            (click)="navigation.today && range.set(navigation.today())"',
  '          >',
  '            Today',
  '          </button>',
  '          <button',
  '            type="button"',
  '            aria-label="Next period"',
  `            class="${BUTTON}"`,
  '            [disabled]="!navigation.next"',
  '            (click)="navigation.next && range.set(navigation.next)"',
  '          >',
  '            ›',
  '          </button>',
  '        </div>',
  '',
  '        <h2 class="mr-auto truncate text-lg font-semibold">{{ title }}</h2>',
  '',
  '      </div>',
  '',
  '      <section',
  '        class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/15 dark:bg-slate-950"',
  '      >',
  '        <div class="min-h-0 flex-1 overflow-auto">'
]

const CLOSING_BASE: readonly string[] = [
  '        </div>',
  '      </section>',
  '    </div>',
  '  `',
  '})',
  'export class BoardComponent {',
  '  readonly range = signal<CalendarRange>(INITIAL_RANGE)',
  '  readonly events = signal<EventInput<EventData>[]>(EVENTS)',
  '  readonly LOCALE = LOCALE'
]

export const FULL_CLOSING = (renderer: {
  clock: boolean
  today: boolean
  month: boolean
}): readonly string[] => [
  ...CLOSING_BASE,
  ...(renderer.today
    ? ['  readonly today = injectNow(() => this.range().timeZone)']
    : []),
  ...(renderer.month
    ? [
        '  readonly MONTH_LANE_HEIGHT = MONTH_LANE_HEIGHT',
        '  readonly MONTH_MAX_LANES = MONTH_MAX_LANES',
        '  readonly NUMBER_HEIGHT = NUMBER_HEIGHT',
        '  readonly BAR_GAP = BAR_GAP'
      ]
    : []),
  ...(renderer.today ? NUMBER_CLASS : []),
  ...(renderer.clock
    ? [
        '  readonly HOUR_HEIGHT = HOUR_HEIGHT',
        '  readonly ALL_DAY_LANE_HEIGHT = ALL_DAY_LANE_HEIGHT',
        '  readonly MIN_BOX_HEIGHT = MIN_BOX_HEIGHT',
        '  readonly COMPACT_BOX_HEIGHT = COMPACT_BOX_HEIGHT',
        '  readonly BOX_GAP = BOX_GAP',
        '  readonly SCROLL_TO_HOUR = SCROLL_TO_HOUR',
        "  readonly clock = (at: IsoDateTime): string => formatIso(at, { locale: this.LOCALE, options: { hour: '2-digit', minute: '2-digit' } })"
      ]
    : []),
  '}'
]

const NUMBER_CLASS: readonly string[] = [
  '  numberClass(isToday: boolean): string {',
  '    return isToday ? "flex size-6 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold dark:bg-orange-900" : "flex size-6 items-center justify-center text-xs font-medium"',
  '  }'
]
