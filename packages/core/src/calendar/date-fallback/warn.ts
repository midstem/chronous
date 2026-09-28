let hasWarnedFallback = false
const warnedApproximations = new Set<string>()

export const resetFallbackWarning = (): void => {
  hasWarnedFallback = false
  warnedApproximations.clear()
}

export const warnApproximation = (key: string, detail: string): void => {
  if (warnedApproximations.has(key)) return
  warnedApproximations.add(key)
  // eslint-disable-next-line no-console
  console.warn(
    `[@midstem/chronous] ${detail} Install temporal-polyfill and import temporal-polyfill/global for exact calendar behavior.`
  )
}

export const warnFallbackOnce = (): void => {
  if (hasWarnedFallback) return

  hasWarnedFallback = true
  // A missing polyfill must be visible to application developers.
  // eslint-disable-next-line no-console
  console.warn(
    '[@midstem/chronous] Temporal is missing; using an approximate Date fallback. Install temporal-polyfill and import temporal-polyfill/global before rendering for exact calendar behavior.'
  )
}
