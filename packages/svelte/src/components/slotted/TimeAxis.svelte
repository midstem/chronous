<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useTimeGridContext } from '../context'
  import { styleText } from '../helpers'
  import type { TimeGridContextValue } from '../context'
  let {
    as = 'div',
    children,
    style,
    ...rest
  }: {
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[TimeGridContextValue]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const scope = useTimeGridContext()
</script>

<svelte:element
  this={as}
  {...rest}
  style={styleText({ position: 'relative', height: scope.dayHeight }, style)}
  >{#if children}{@render children(scope)}{/if}</svelte:element
>
