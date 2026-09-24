import { useId } from 'react'
import type { ReactElement } from 'react'

import type {
  FrameProps,
  NumberFieldProps,
  SelectFieldProps,
  TextFieldProps
} from './types'

const Frame = ({
  id,
  label,
  hint,
  labelHidden,
  children
}: FrameProps): ReactElement => (
  <div className="flex flex-col gap-1">
    <label
      className={
        labelHidden
          ? 'sr-only'
          : 'font-mono text-xs font-semibold tracking-tight text-ink'
      }
      htmlFor={id}
    >
      {label}
    </label>
    {children}
    {hint && <span className="text-[11px] leading-4 text-muted">{hint}</span>}
  </div>
)

export const SelectField = ({
  label,
  hint,
  labelHidden,
  value,
  options,
  onChange
}: SelectFieldProps): ReactElement => {
  const id = useId()

  return (
    <Frame id={id} label={label} hint={hint} labelHidden={labelHidden}>
      <select
        id={id}
        className="field-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Frame>
  )
}

export const NumberField = ({
  label,
  hint,
  value,
  placeholder,
  onChange
}: NumberFieldProps): ReactElement => {
  const id = useId()

  return (
    <Frame id={id} label={label} hint={hint}>
      <input
        id={id}
        className="field-control"
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Frame>
  )
}

export const TextField = ({
  label,
  hint,
  value,
  type = 'text',
  suggestions,
  placeholder,
  onChange
}: TextFieldProps): ReactElement => {
  const id = useId()
  const listId = `${id}-list`

  return (
    <Frame id={id} label={label} hint={hint}>
      <input
        id={id}
        className="field-control"
        type={type}
        value={value}
        list={suggestions ? listId : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </Frame>
  )
}

export type * from './types'
