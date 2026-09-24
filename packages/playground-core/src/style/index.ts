export type Style = 'default' | 'simple'

export type StyleOption = {
  value: Style
  label: string
}

export const STYLE_OPTIONS: readonly StyleOption[] = [
  { value: 'default', label: 'Default — the full board' },
  { value: 'simple', label: 'Simple — plain markup' }
]

export const DEFAULT_STYLE: Style = 'default'

export const isSimple = (style: Style): boolean => style === 'simple'
