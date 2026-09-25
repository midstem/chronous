import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export type Scope<TValue> = {
  key: InjectionKey<TValue>
  provideScope: (value: TValue) => void
  useScope: () => TValue
}

export const scopeOf = <TValue>(
  name: string,
  parent: string
): Scope<TValue> => {
  const key: InjectionKey<TValue> = Symbol(name)

  const provideScope = (value: TValue): void => {
    provide(key, value)
  }

  const useScope = (): TValue => {
    const value = inject(key, null)

    if (!value) throw new Error(`${name} is only readable inside <${parent}>`)

    return value
  }

  return { key, provideScope, useScope }
}
