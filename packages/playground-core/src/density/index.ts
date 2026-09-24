export type Density = 'compact' | 'cosy' | 'roomy'

export type DensityOption = {
  value: Density
  label: string
  hourHeight: number
}

export const DENSITIES: readonly DensityOption[] = [
  { value: 'compact', label: 'S', hourHeight: 44 },
  { value: 'cosy', label: 'M', hourHeight: 60 },
  { value: 'roomy', label: 'L', hourHeight: 84 }
]

export const DEFAULT_DENSITY: Density = 'cosy'

export const hourHeightOf = (density: Density): number =>
  (DENSITIES.find((option) => option.value === density) ?? DENSITIES[1])
    .hourHeight
