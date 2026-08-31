import type { Context } from 'react'
import { createContext, useContext } from 'react'

export type Scope<TValue> = {
  Provider: Context<TValue | null>['Provider']
  useScope: () => TValue
}

export const scopeOf = <TValue>(
  name: string,
  parent: string
): Scope<TValue> => {
  const context = createContext<TValue | null>(null)

  context.displayName = name

  const useScope = (): TValue => {
    const value = useContext(context)

    if (!value) throw new Error(`${name} is only readable inside <${parent}>`)

    return value
  }

  return { Provider: context.Provider, useScope }
}
