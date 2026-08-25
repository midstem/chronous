import { useId } from 'react'
import type { ReactElement } from 'react'

import type {
  FrameProps,
  NumberFieldProps,
  SelectFieldProps,
  TextFieldProps
} from './types'

const Frame = ({ id, label, hint, children }: FrameProps): ReactElement => (
  <div className="field">
    <label className="field-label" htmlFor={id}>
      {label}
    </label>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </div>
)

export const SelectField = ({
  label,
  hint,
  value,
  options,
  onChange
}: SelectFieldProps): ReactElement => {
  const id = useId()

  return (
    <Frame id={id} label={label} hint={hint}>
      <select
        id={id}
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
