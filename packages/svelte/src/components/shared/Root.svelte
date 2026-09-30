<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarRange, EventInput, LocaleId } from '../../engine.js'
  import { resultOf } from '../../calendar/helpers'
  import type { CalendarError } from '../../calendar/types'
  import { provideCalendar } from '../context'
  import { GUTTER_WIDTH, styleText } from '../helpers'
  import type { CalendarContextValue } from '../context'
  let {
    as = 'div',
    range,
    events,
    locale = 'en-US',
    gutterWidth = GUTTER_WIDTH,
    children,
    renderError,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    range: CalendarRange
    events: readonly EventInput<TData>[]
    locale?: LocaleId
    gutterWidth?: string
    children?: Snippet<[CalendarContextValue<TData>]>
    renderError?: Snippet<[CalendarError]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  let result = $derived(resultOf(range, events))
  const raise = (error: CalendarError): never => {
    throw error
  }
  const context: CalendarContextValue<TData> = {
    get calendar() {
      if (!result.calendar) throw result.error
      return result.calendar
    },
    get range() {
      return range
    },
    get locale() {
      return locale
    },
    get gutterWidth() {
      return gutterWidth
    }
  }
  provideCalendar(context)
</script>

<svelte:element this={as} {...rest} style={styleText({}, style)}>
  {#if result.error}
    {#if renderError}{@render renderError(result.error)}{:else}{raise(
        result.error
      )}{/if}
  {:else if children}
    {@render children(context)}
  {/if}
</svelte:element>
