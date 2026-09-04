import { subscribeTemporal, temporalStatus } from '@midstem/chronous'
import type { TemporalStatus } from '@midstem/chronous'
import { DestroyRef, inject, signal } from '@angular/core'
import type { Signal } from '@angular/core'

export const injectTemporalStatus = (): Signal<TemporalStatus> => {
  const status = signal(temporalStatus())
  const unsubscribe = subscribeTemporal(() => status.set(temporalStatus()))

  inject(DestroyRef).onDestroy(unsubscribe)

  return status.asReadonly()
}
