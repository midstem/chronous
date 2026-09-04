import type { EmbeddedViewRef } from '@angular/core'

import type { ViewAttributes, ViewStyle } from './types'

export const elementOf = (view: EmbeddedViewRef<object>): HTMLElement | null =>
  view.rootNodes.find(
    (node: unknown): node is HTMLElement => node instanceof HTMLElement
  ) ?? null

export const applyStyle = (
  element: HTMLElement | null,
  style: ViewStyle
): void => {
  if (!element) return

  for (const [property, value] of Object.entries(style))
    element.style.setProperty(property, value)
}

export const applyAttributes = (
  element: HTMLElement | null,
  attributes: ViewAttributes
): void => {
  if (!element) return

  for (const [name, value] of Object.entries(attributes))
    element.setAttribute(name, value)
}
