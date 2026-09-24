import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import type { ViewKind } from '@midstem/chronous-angular'
import {
  DATE_HINT,
  DAY_COUNT_HINT,
  DISAMBIGUATION_HINT,
  DISAMBIGUATION_OPTIONS,
  LOCALES,
  LOCALE_HINT,
  PRESETS,
  PRESET_HINT,
  SLOT_MINUTES_HINT,
  STYLE_HINT,
  STYLE_OPTIONS,
  TIME_ZONE_HINT,
  VIEW_HINT,
  VIEW_OPTIONS,
  WEEK_STARTS_ON_HINT,
  WEEK_STARTS_ON_OPTIONS,
  ZONES
} from '@midstem/playground-core'
import type { Option, PresetId, Style } from '@midstem/playground-core'

import { NumberFieldComponent } from '../fields/number-field.component'
import { SelectFieldComponent } from '../fields/select-field.component'
import { TextFieldComponent } from '../fields/text-field.component'
import { PanelComponent } from '../panel/panel.component'
import { PlaygroundService } from '../playground/playground.service'

const PRESET_OPTIONS: readonly Option[] = PRESETS.map(({ id, label }) => ({
  value: id,
  label
}))

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    PanelComponent,
    SelectFieldComponent,
    TextFieldComponent,
    NumberFieldComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
      <app-panel title="Style" badge="playground only">
        <app-select-field
          label="style"
          [labelHidden]="true"
          [hint]="styleHint"
          [value]="state().style"
          [options]="styleOptions"
          (valueChange)="updateStyle($event)"
        />
      </app-panel>

      <app-panel title="Fixture" badge="playground only">
        <app-select-field
          label="preset"
          [hint]="presetHint"
          [value]="state().preset"
          [options]="presetOptions"
          (valueChange)="choosePreset($event)"
        />
      </app-panel>

      <app-panel title="CalendarRange" badge="buildCalendar argument">
        <app-select-field
          label="view"
          [hint]="viewHint"
          [value]="state().view"
          [options]="viewOptions"
          (valueChange)="updateView($event)"
        />
        <app-text-field
          label="currentDate"
          type="date"
          [hint]="dateHint"
          [value]="state().currentDate"
          (valueChange)="updateCurrentDate($event)"
        />
        <app-text-field
          label="timeZone"
          [hint]="timeZoneHint"
          [value]="state().timeZone"
          [suggestions]="zones"
          (valueChange)="updateTimeZone($event)"
        />
        <app-select-field
          label="weekStartsOn"
          [hint]="weekStartsOnHint"
          [value]="state().weekStartsOn"
          [options]="weekStartsOnOptions"
          (valueChange)="updateWeekStartsOn($event)"
        />
        <app-number-field
          label="dayCount"
          [hint]="dayCountHint"
          [value]="state().dayCount"
          placeholder="unset"
          (valueChange)="updateDayCount($event)"
        />
        <app-number-field
          label="slotMinutes"
          [hint]="slotMinutesHint"
          [value]="state().slotMinutes"
          placeholder="unset"
          (valueChange)="updateSlotMinutes($event)"
        />
        <app-select-field
          label="disambiguation"
          [hint]="disambiguationHint"
          [value]="state().disambiguation"
          [options]="disambiguationOptions"
          (valueChange)="updateDisambiguation($event)"
        />
      </app-panel>

      <app-panel title="Labels" badge="playground only">
        <app-text-field
          label="locale"
          [hint]="localeHint"
          [value]="state().locale"
          [suggestions]="locales"
          (valueChange)="updateLocale($event)"
        />
      </app-panel>
    </div>
  `
})
export class ControlsComponent {
  readonly #playground = inject(PlaygroundService)

  readonly state = this.#playground.state

  readonly styleHint = STYLE_HINT
  readonly styleOptions = STYLE_OPTIONS

  readonly presetHint = PRESET_HINT
  readonly presetOptions = PRESET_OPTIONS

  readonly viewHint = VIEW_HINT
  readonly viewOptions = VIEW_OPTIONS

  readonly dateHint = DATE_HINT
  readonly timeZoneHint = TIME_ZONE_HINT
  readonly zones = ZONES

  readonly weekStartsOnHint = WEEK_STARTS_ON_HINT
  readonly weekStartsOnOptions = WEEK_STARTS_ON_OPTIONS

  readonly dayCountHint = DAY_COUNT_HINT
  readonly slotMinutesHint = SLOT_MINUTES_HINT

  readonly disambiguationHint = DISAMBIGUATION_HINT
  readonly disambiguationOptions = DISAMBIGUATION_OPTIONS

  readonly localeHint = LOCALE_HINT
  readonly locales = LOCALES

  updateStyle(style: string): void {
    this.#playground.update({ style: style as Style })
  }

  choosePreset(preset: string): void {
    this.#playground.choosePreset(preset as PresetId)
  }

  updateView(view: string): void {
    this.#playground.update({ view: view as ViewKind })
  }

  updateCurrentDate(currentDate: string): void {
    this.#playground.update({ currentDate })
  }

  updateTimeZone(timeZone: string): void {
    this.#playground.update({ timeZone })
  }

  updateWeekStartsOn(weekStartsOn: string): void {
    this.#playground.update({ weekStartsOn })
  }

  updateDayCount(dayCount: string): void {
    this.#playground.update({ dayCount })
  }

  updateSlotMinutes(slotMinutes: string): void {
    this.#playground.update({ slotMinutes })
  }

  updateDisambiguation(disambiguation: string): void {
    this.#playground.update({ disambiguation })
  }

  updateLocale(locale: string): void {
    this.#playground.update({ locale })
  }
}
