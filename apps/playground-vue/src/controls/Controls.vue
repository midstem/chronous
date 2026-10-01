<script setup lang="ts">
import type { ViewKind } from '@midstem/chronous-vue'
import {
  DATE_HINT,
  DAY_COUNT_HINT,
  DISAMBIGUATION_HINT,
  DISAMBIGUATION_OPTIONS,
  LOCALES,
  LOCALE_OPTIONS,
  LOCALE_HINT,
  PRESET_HINT,
  PRESET_OPTIONS,
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
import type { PresetId, Style } from '@midstem/playground-core'

import NumberField from '../fields/NumberField.vue'
import ChoiceTextField from '../fields/ChoiceTextField.vue'
import SelectField from '../fields/SelectField.vue'
import TextField from '../fields/TextField.vue'
import Panel from '../panel/Panel.vue'
import { usePlayground } from '../playground/use-playground'

const playground = usePlayground()
const { state } = playground

const updateStyle = (style: string): void => {
  playground.update({ style: style as Style })
}

const choosePreset = (preset: string): void => {
  playground.choosePreset(preset as PresetId)
}

const updateView = (view: string): void => {
  playground.update({ view: view as ViewKind })
}

const updateCurrentDate = (currentDate: string): void => {
  playground.update({ currentDate })
}

const updateTimeZone = (timeZone: string): void => {
  playground.update({ timeZone })
}

const updateWeekStartsOn = (weekStartsOn: string): void => {
  playground.update({ weekStartsOn })
}

const updateDayCount = (dayCount: string): void => {
  playground.update({ dayCount })
}

const updateSlotMinutes = (slotMinutes: string): void => {
  playground.update({ slotMinutes })
}

const updateDisambiguation = (disambiguation: string): void => {
  playground.update({ disambiguation })
}

const updateLocale = (locale: string): void => {
  playground.update({ locale })
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
    <Panel title="Appearance" badge="playground">
      <SelectField
        label="style"
        :label-hidden="true"
        :hint="STYLE_HINT"
        :value="state.style"
        :options="STYLE_OPTIONS"
        @update:value="updateStyle"
      />
    </Panel>

    <Panel title="Event examples" badge="loads sample data">
      <SelectField
        label="preset"
        :hint="PRESET_HINT"
        :value="state.preset"
        :options="PRESET_OPTIONS"
        @update:value="choosePreset"
      />
    </Panel>

    <Panel title="Calendar options" badge="buildCalendar range">
      <SelectField
        label="view"
        :hint="VIEW_HINT"
        :value="state.view"
        :options="VIEW_OPTIONS"
        @update:value="updateView"
      />
      <TextField
        label="currentDate"
        type="date"
        :hint="DATE_HINT"
        :value="state.currentDate"
        @update:value="updateCurrentDate"
      />
      <ChoiceTextField
        label="timeZone"
        :hint="TIME_ZONE_HINT"
        :value="state.timeZone"
        :options="ZONES"
        @update:value="updateTimeZone"
      />
      <SelectField
        label="weekStartsOn"
        :hint="WEEK_STARTS_ON_HINT"
        :value="state.weekStartsOn"
        :options="WEEK_STARTS_ON_OPTIONS"
        @update:value="updateWeekStartsOn"
      />
      <NumberField
        label="dayCount"
        :hint="DAY_COUNT_HINT"
        :value="state.dayCount"
        placeholder="unset"
        @update:value="updateDayCount"
      />
      <NumberField
        label="slotMinutes"
        :hint="SLOT_MINUTES_HINT"
        :value="state.slotMinutes"
        placeholder="unset"
        @update:value="updateSlotMinutes"
      />
      <SelectField
        label="disambiguation"
        :hint="DISAMBIGUATION_HINT"
        :value="state.disambiguation"
        :options="DISAMBIGUATION_OPTIONS"
        @update:value="updateDisambiguation"
      />
    </Panel>

    <Panel title="Language and labels" badge="playground">
      <ChoiceTextField
        label="locale"
        :hint="LOCALE_HINT"
        :value="state.locale"
        :options="LOCALES"
        :option-labels="LOCALE_OPTIONS"
        @update:value="updateLocale"
      />
    </Panel>
  </div>
</template>
