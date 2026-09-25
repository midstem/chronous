<script setup lang="ts">
import { computed } from 'vue'
import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-vue'
import { isSimple } from '@midstem/playground-core'
import type { EventData, Style } from '@midstem/playground-core'

import Code from '../code/Code.vue'

import {
  FILE_NAME,
  SIMPLE_HINT,
  SNIPPET_HINT,
  badgeOf,
  simpleBadgeOf
} from './constants'
import { snippetOf } from './helpers'
import { simpleOf } from './simple'

const props = defineProps<{
  range: CalendarRange
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  hourHeight: number
  style: Style
}>()

const simple = computed(() => isSimple(props.style))

const hint = computed(() => (simple.value ? SIMPLE_HINT : SNIPPET_HINT))

const badge = computed(() =>
  simple.value
    ? simpleBadgeOf(props.range.view, props.events.length)
    : badgeOf(
        props.range.view,
        props.hourHeight,
        props.locale,
        props.events.length
      )
)

const source = computed(() =>
  simple.value
    ? simpleOf(props.range, props.events, props.locale, props.hourHeight)
    : snippetOf(props.range, props.events, props.locale, props.hourHeight)
)
</script>

<template>
  <Code
    :file-name="FILE_NAME"
    :badge="badge"
    :hint="hint"
    :source="source"
  />
</template>
