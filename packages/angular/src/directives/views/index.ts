import type {
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef
} from '@angular/core'

import { applyAttributes, applyStyle, elementOf } from './helpers'
import type { ViewSetup, ViewSlot } from './types'

export const slotOf = (): ViewSlot => ({ template: null, view: null })

export const syncSlot = (
  slot: ViewSlot,
  container: ViewContainerRef,
  template: TemplateRef<object> | null,
  context: object
): void => {
  if (slot.template !== template) {
    container.clear()

    slot.template = template
    slot.view = template
      ? container.createEmbeddedView(template, context)
      : null

    return
  }

  if (!slot.view) return

  Object.assign(slot.view.context, context)
  slot.view.markForCheck()
}

export const syncViews = <TItem, TContext extends object>(
  container: ViewContainerRef,
  template: TemplateRef<TContext>,
  items: readonly TItem[],
  setup: ViewSetup<TItem, TContext>
): void => {
  while (container.length > items.length) container.remove(container.length - 1)

  items.forEach((item, index) => {
    const context = setup.contextOf(item, index)
    const held = container.get(index) as EmbeddedViewRef<TContext> | null

    if (held) {
      Object.assign(held.context, context)
      held.markForCheck()
    }

    const view = held ?? container.createEmbeddedView(template, context)
    const element = elementOf(view)

    applyAttributes(element, setup.attributesOf?.(item, index) ?? {})
    applyStyle(element, setup.styleOf?.(item, index) ?? {})
  })
}

export type * from './types'
