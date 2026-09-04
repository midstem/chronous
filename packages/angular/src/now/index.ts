import type { TimeZoneId } from '@midstem/chronous'
import {
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal
} from '@angular/core'
import type { Signal } from '@angular/core'

import { TICK_MS, formatterOf, nowOf } from './helpers'
import type { CalendarNow } from './types'

export const injectNow = (
  timeZone: () => TimeZoneId
): Signal<CalendarNow | null> => {
  const at = signal<Date | null>(null)
  const formatter = computed(() => formatterOf(timeZone()))
  const destroyRef = inject(DestroyRef)

  afterNextRender(() => {
    at.set(new Date())

    const ticking = window.setInterval(() => at.set(new Date()), TICK_MS)

    destroyRef.onDestroy(() => window.clearInterval(ticking))
  })

  return computed(() => nowOf(formatter(), at()))
}

export type * from './types'
