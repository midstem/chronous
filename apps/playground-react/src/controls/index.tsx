import type { ViewKind } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { ChoiceTextField, NumberField, SelectField, TextField } from '../fields'
import { PRESET_OPTIONS } from '@midstem/playground-core'
import type { PresetId } from '../fixtures'
import { Panel } from '../panel'
import type { PlaygroundState } from '../playground'
import { STYLE_OPTIONS } from '../style'
import type { Style } from '../style'

import {
  DATE_HINT,
  DAY_COUNT_HINT,
  DISAMBIGUATION_HINT,
  DISAMBIGUATION_OPTIONS,
  LOCALES,
  LOCALE_OPTIONS,
  LOCALE_HINT,
  PRESET_HINT,
  STYLE_HINT,
  SLOT_MINUTES_HINT,
  TIME_ZONE_HINT,
  VIEW_HINT,
  VIEW_OPTIONS,
  WEEK_STARTS_ON_HINT,
  WEEK_STARTS_ON_OPTIONS,
  ZONES
} from './constants'

type ControlsProps = {
  state: PlaygroundState
  update: (patch: Partial<PlaygroundState>) => void
  choosePreset: (id: PresetId) => void
}

export const Controls = ({
  state,
  update,
  choosePreset
}: ControlsProps): ReactElement => (
  <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
    <Panel title="Appearance" badge="playground">
      <SelectField
        label="style"
        labelHidden
        hint={STYLE_HINT}
        value={state.style}
        options={STYLE_OPTIONS}
        onChange={(value) => update({ style: value as Style })}
      />
    </Panel>

    <Panel title="Event examples" badge="loads sample data">
      <SelectField
        label="preset"
        hint={PRESET_HINT}
        value={state.preset}
        options={PRESET_OPTIONS}
        onChange={(value) => choosePreset(value as PresetId)}
      />
    </Panel>

    <Panel title="Calendar options" badge="buildCalendar range">
      <SelectField
        label="view"
        hint={VIEW_HINT}
        value={state.view}
        options={VIEW_OPTIONS}
        onChange={(value) => update({ view: value as ViewKind })}
      />
      <TextField
        label="currentDate"
        type="date"
        hint={DATE_HINT}
        value={state.currentDate}
        onChange={(currentDate) => update({ currentDate })}
      />
      <ChoiceTextField
        label="timeZone"
        hint={TIME_ZONE_HINT}
        value={state.timeZone}
        options={ZONES}
        onChange={(timeZone) => update({ timeZone })}
      />
      <SelectField
        label="weekStartsOn"
        hint={WEEK_STARTS_ON_HINT}
        value={state.weekStartsOn}
        options={WEEK_STARTS_ON_OPTIONS}
        onChange={(weekStartsOn) => update({ weekStartsOn })}
      />
      <NumberField
        label="dayCount"
        hint={DAY_COUNT_HINT}
        value={state.dayCount}
        placeholder="unset"
        onChange={(dayCount) => update({ dayCount })}
      />
      <NumberField
        label="slotMinutes"
        hint={SLOT_MINUTES_HINT}
        value={state.slotMinutes}
        placeholder="unset"
        onChange={(slotMinutes) => update({ slotMinutes })}
      />
      <SelectField
        label="disambiguation"
        hint={DISAMBIGUATION_HINT}
        value={state.disambiguation}
        options={DISAMBIGUATION_OPTIONS}
        onChange={(disambiguation) => update({ disambiguation })}
      />
    </Panel>

    <Panel title="Language and labels" badge="playground">
      <ChoiceTextField
        label="locale"
        hint={LOCALE_HINT}
        value={state.locale}
        options={LOCALES}
        optionLabels={LOCALE_OPTIONS}
        onChange={(locale) => update({ locale })}
      />
    </Panel>
  </div>
)
