<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useCalendarContext } from '../context'
  import type { CalendarContextValue } from '../context'
  import { styleText, templateOf } from '../helpers'
  let {
    as = 'div',
    children,
    style,
    gutterCell,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[CalendarContextValue]>
    style?: string | Record<string, string | number>
    gutterCell?: Snippet
    [key: string]: unknown
  } = $props()
  const scope = useCalendarContext()
  let css = $derived(
    styleText(
      {
        display: 'grid',
        gridTemplateColumns: templateOf(
          scope.gutterWidth,
          scope.calendar.days.length
        )
      },
      style
    )
  )
</script>

<svelte:element this={as} {...rest} style={css}
  ><div>
    {#if gutterCell}{@render gutterCell()}{/if}
  </div>
  {#if children}{@render children(scope)}{/if}</svelte:element
>
