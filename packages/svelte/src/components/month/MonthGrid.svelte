<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import { useCalendarContext } from '../context'
  import type { CalendarContextValue } from '../context'
  import { styleText } from '../helpers'
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[CalendarContextValue<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const scope = useCalendarContext<TData>()
</script>

<svelte:element
  this={as}
  {...rest}
  style={styleText(
    { display: 'flex', flexDirection: 'column', minHeight: '100%' },
    style
  )}
  >{#if children}{@render children(scope)}{/if}</svelte:element
>
