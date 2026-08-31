import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType
} from 'react'
import type { ReactNode } from 'react'

export type Slot<TScope> = ReactNode | ((scope: TScope) => ReactNode)

export type OwnProps<TScope> = {
  children?: Slot<TScope>
  style?: CSSProperties
}

export type PolymorphicProps<TTag extends ElementType, TOwn> = TOwn & {
  as?: TTag
} & Omit<
    ComponentPropsWithoutRef<TTag>,
    'as' | 'style' | 'children' | keyof TOwn
  >
