import type { ReactElement } from 'react'

import { LOCAL_TIME_ZONE, LOCALES, SELECT_CLASS, TIME_ZONES } from './constants'
import type { SettingsProps } from './types'

export const Settings = ({
  locale,
  timeZone,
  onLocale,
  onTimeZone
}: SettingsProps): ReactElement => (
  <div className="flex flex-wrap items-end gap-4">
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      Locale
      <select
        className={SELECT_CLASS}
        value={locale}
        onChange={(event) => onLocale(event.target.value)}
      >
        {LOCALES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      Time zone
      <select
        className={SELECT_CLASS}
        value={timeZone ?? LOCAL_TIME_ZONE}
        onChange={(event) => onTimeZone(event.target.value || undefined)}
      >
        {TIME_ZONES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  </div>
)

export { readSettings, todayIn } from './helpers'

export type * from './types'
