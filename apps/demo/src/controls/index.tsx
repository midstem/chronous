import type { ViewKind } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { NumberField, SelectField, TextField } from '../fields'
import { PRESETS } from '../fixtures'
import type { PresetId } from '../fixtures'
import type { PlaygroundState } from '../playground'

import {
  DATE_HINT,
  DAY_COUNT_HINT,
  DISAMBIGUATION_HINT,
  DISAMBIGUATION_OPTIONS,
  LOCALES,
  LOCALE_HINT,
  PRESET_HINT,
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

const PRESET_OPTIONS = PRESETS.map(({ id, label }) => ({ value: id, label }))

export const Controls = ({
  state,
  update,
  choosePreset
}: ControlsProps): ReactElement => (
  <aside className="controls">
    <section className="panel">
      <h2 className="panel-title">
        RangeSpec
        <span className="panel-badge">buildCalendar argument</span>
      </h2>
      <SelectField
        label="view"
        hint={VIEW_HINT}
        value={state.view}
        options={VIEW_OPTIONS}
        onChange={(value) => update({ view: value as ViewKind })}
      />
      <TextField
        label="date"
        type="date"
        hint={DATE_HINT}
        value={state.date}
        onChange={(date) => update({ date })}
      />
      <TextField
        label="timeZone"
        hint={TIME_ZONE_HINT}
        value={state.timeZone}
        suggestions={ZONES}
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
    </section>

    <section className="panel">
      <h2 className="panel-title">
        Labels
        <span className="panel-badge">playground only</span>
      </h2>
      <TextField
        label="locale"
        hint={LOCALE_HINT}
        value={state.locale}
        suggestions={LOCALES}
        onChange={(locale) => update({ locale })}
      />
    </section>

    <section className="panel">
      <h2 className="panel-title">
        Fixture
        <span className="panel-badge">playground only</span>
      </h2>
      <SelectField
        label="preset"
        hint={PRESET_HINT}
        value={state.preset}
        options={PRESET_OPTIONS}
        onChange={(value) => choosePreset(value as PresetId)}
      />
    </section>
  </aside>
)
