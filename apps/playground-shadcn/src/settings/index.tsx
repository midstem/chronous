import type { ReactElement } from 'react'

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { LOCAL_TIME_ZONE, LOCALES, TIME_ZONES } from './constants'
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
      <NativeSelect
        value={locale}
        onChange={(event) => onLocale(event.target.value)}
      >
        {LOCALES.map(({ value, label }) => (
          <NativeSelectOption key={value} value={value}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      Time zone
      <NativeSelect
        value={timeZone ?? LOCAL_TIME_ZONE}
        onChange={(event) => onTimeZone(event.target.value || undefined)}
      >
        {TIME_ZONES.map(({ value, label }) => (
          <NativeSelectOption key={value} value={value}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  </div>
)

export { readSettings, todayIn } from './helpers'

export type * from './types'
