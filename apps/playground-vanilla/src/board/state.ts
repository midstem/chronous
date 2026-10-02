import type { CalendarLayout } from '@midstem/chronous'
import { STATE_HINT, jsonOf, summaryOf } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'
import { escapeHtml } from '../views/helpers'

export const createStateInspector = (
  calendar: CalendarLayout<EventData>
): HTMLDetailsElement => {
  const details = document.createElement('details')
  details.className = 'shrink-0 border-t border-line bg-raised'

  const summaryItems = summaryOf(calendar)
  const jsonContent = jsonOf(calendar)

  details.innerHTML = `
    <summary class="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-muted">
      ${summaryItems
        .map(
          ({ label, value }) => `
        <span class="flex items-baseline gap-1">
          <span class="text-faint">${label}</span>
          <span class="font-mono text-ink">${value}</span>
        </span>`
        )
        .join('')}
    </summary>
    <div class="flex flex-col gap-2 px-3 pb-3">
      <p class="text-[11px] text-muted">${STATE_HINT}</p>
      <pre class="max-h-80 overflow-auto rounded-md bg-sunken p-3 font-mono text-[11px] leading-5">${escapeHtml(jsonContent)}</pre>
    </div>
  `

  return details
}
