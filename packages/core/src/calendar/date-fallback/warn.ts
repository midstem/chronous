let hasWarnedFallback = false

export const resetFallbackWarning = (): void => {
  hasWarnedFallback = false
}

export const warnFallbackOnce = (): void => {
  if (hasWarnedFallback) return

  hasWarnedFallback = true
  // The opt-in degraded mode must be visible to application developers.
  // eslint-disable-next-line no-console
  console.warn(
    '[@midstem/chronous] Date fallback is active. It supports only non-recurring, fixed-offset or all-day events on non-transition days. For full calendar capabilities, install and import temporal-polyfill.'
  )
}
