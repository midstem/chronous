import type { EmbeddedViewRef, TemplateRef } from '@angular/core'

export type ViewStyle = Record<string, string>

export type ViewAttributes = Record<string, string>

export type ViewSetup<TItem, TContext extends object> = {
  contextOf: (item: TItem, index: number) => TContext
  styleOf?: (item: TItem, index: number) => ViewStyle
  attributesOf?: (item: TItem, index: number) => ViewAttributes
}

export type ViewSlot = {
  template: TemplateRef<object> | null
  view: EmbeddedViewRef<object> | null
}
