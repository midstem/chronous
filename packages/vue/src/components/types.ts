import type { Component, VNodeChild } from 'vue'

export type ScopedSlot<TScope> = (scope: TScope) => VNodeChild

export type AsTag = Component | string
