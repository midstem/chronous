import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'
import type {
  CalendarBox,
  IsoDate,
  LocaleId,
  TimedEntry
} from '@midstem/chronous-angular'
import {
  BOX_GAP,
  COMPACT_BOX_HEIGHT,
  CONTINUES,
  HOURS_IN_DAY,
  MIN_BOX_HEIGHT,
  SCROLL_TO_HOUR,
  formatDay,
  formatTime,
  toneOf
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { AlldayComponent } from '../allday/allday.component'

@Component({
  selector: 'app-slotted',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES, AlldayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sticky top-0 z-30 bg-surface">
      <div chronousHeader class="border-b border-line">
        <div></div>
        <div
          *chronousDayHeadings="
            let day;
            let weekdayLabel = weekdayLabel;
            let dayLabel = dayLabel
          "
          class="border-l border-hair py-2"
        >
          <div
            class="flex flex-col items-center gap-0.5"
            [attr.title]="formatDay(day.date, locale())"
          >
            <span
              class="text-[10px] font-medium tracking-wide text-muted uppercase"
            >
              {{ weekdayLabel }}
            </span>
            <span [class]="numberClass(day.date === today())">
              {{ dayLabel }}
            </span>
          </div>
        </div>
      </div>

      <app-allday />
    </div>

    <chronous-time-grid
      [hourHeight]="hourHeight()"
      [scrollToHour]="scrollToHour"
    >
      <div chronousTimeAxis>
        <div
          *chronousTimeLabels="
            let slot;
            let minuteOfDay = minuteOfDay;
            let timeLabel = timeLabel
          "
          class="right-2 text-[10px] tabular-nums text-faint"
        >
          @if (minuteOfDay > 0) {
            {{ timeLabel }}
          }
        </div>
      </div>

      <div *chronousDayColumns="let day" class="border-l border-hair">
        <span *chronousTimeSlots="day" class="border-t border-hair"></span>

        <div *chronousNowMarker="day" class="border-t-2 border-now">
          <span
            class="absolute -top-[5px] -left-1 size-2 rounded-full bg-now"
          ></span>
        </div>

        <div
          *chronousTimedEvents="
            day;
            let event;
            let box = box;
            minHeight: minBoxHeight;
            gap: boxGap
          "
          class="hover:z-20"
        >
          <div
            [class]="
              'h-full overflow-hidden rounded-md border border-surface px-1.5 py-px text-[11px] leading-[1.35] shadow-sm transition-[filter] hover:brightness-110 ' +
              toneOf(event.id)
            "
            [attr.title]="boxTitle(event, box)"
          >
            <span class="block truncate font-semibold">
              {{ edge(box.continuesBefore) }}
              {{ eventTitle(event) }}
              {{ edge(box.continuesAfter) }}
            </span>
            @if (isRoomy(box)) {
              <span class="block truncate opacity-80">
                {{ formatTime(box.start, locale()) }} –
                {{ formatTime(box.end, locale()) }}
              </span>
            }
          </div>
        </div>
      </div>
    </chronous-time-grid>
  `
})
export class SlottedComponent {
  readonly locale = input.required<LocaleId>()
  readonly hourHeight = input.required<number>()
  readonly today = input.required<IsoDate | null>()

  readonly scrollToHour = SCROLL_TO_HOUR
  readonly minBoxHeight = MIN_BOX_HEIGHT
  readonly boxGap = BOX_GAP

  readonly formatDay = formatDay
  readonly formatTime = formatTime
  readonly toneOf = toneOf

  edge(shown: boolean): string {
    return shown ? CONTINUES : ''
  }

  numberClass(isToday: boolean): string {
    return isToday
      ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
      : 'flex size-7 items-center justify-center text-sm font-semibold'
  }

  eventTitle(event: TimedEntry<EventData>): string {
    return event.data?.title ?? event.id
  }

  boxTitle(event: TimedEntry<EventData>, box: CalendarBox<EventData>): string {
    const title = this.eventTitle(event)
    const from = formatTime(box.start, this.locale())
    const to = formatTime(box.end, this.locale())
    return `${title}\n${from} – ${to}`
  }

  isRoomy(box: CalendarBox<EventData>): boolean {
    return box.height * this.hourHeight() * HOURS_IN_DAY >= COMPACT_BOX_HEIGHT
  }
}
