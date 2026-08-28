import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Polymorphic `as` prop
// ---------------------------------------------------------------------------

export type AsProp<C extends ElementType> = {
  as?: C
}

export type PolymorphicProps<C extends ElementType, Props = object> = Props &
  AsProp<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof Props | 'as'>

// ---------------------------------------------------------------------------
// Render-prop children helper
// ---------------------------------------------------------------------------

export type RenderProp<Ctx> = ((ctx: Ctx) => ReactNode) | ReactNode

// ---------------------------------------------------------------------------
// Percent & layout constants
// ---------------------------------------------------------------------------

export const PERCENT = 100
export const MINUTES_IN_DAY = 1440
