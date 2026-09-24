import type { ReactNode } from 'react'

export type Option = {
  value: string
  label: string
}

export type FrameProps = {
  id: string
  label: string
  hint?: string
  labelHidden?: boolean
  children: ReactNode
}

export type SelectFieldProps = {
  label: string
  hint?: string
  labelHidden?: boolean
  value: string
  options: readonly Option[]
  onChange: (value: string) => void
}

export type NumberFieldProps = {
  label: string
  hint?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export type TextFieldProps = {
  label: string
  hint?: string
  value: string
  type?: 'text' | 'date'
  suggestions?: readonly string[]
  placeholder?: string
  onChange: (value: string) => void
}
