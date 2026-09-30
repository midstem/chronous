<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { CalendarDay } from '../../engine.js'
  import {
    provideMonthDay,
    useCalendarContext,
    useMonthRowContext
  } from '../context'
  import type { MonthDayContextValue } from '../context'
  import {
    DAY_NUMBER,
    hiddenLanes,
    labelOf,
    laneCount,
    rowBarsByDay,
    styleText
  } from '../helpers'
  type MonthDayScope<T> = MonthDayContextValue<T> & {
    dayLabel: string
    inCurrentPeriod: boolean
    lanes: number
  }
  let {
    day,
    index,
    as = 'div',
    children,
    style,
    ...rest
  }: {
    day: CalendarDay<TData>
    index: number
    as?: keyof HTMLElementTagNameMap
    children?: Snippet<[MonthDayScope<TData>]>
    style?: string | Record<string, string | number>
    [key: string]: unknown
  } = $props()
  const context = useCalendarContext<TData>()
  const rowContext = useMonthRowContext<TData>()
  const value = {
    get day() {
      return day
    },
    get boxes() {
      return day.boxes
    },
    get bars() {
      return rowBarsByDay(rowContext.row, rowContext.days.length)[index] ?? []
    },
    get hiddenBars() {
      return hiddenLanes(this.bars, rowContext.maxLanes)
    }
  }
  provideMonthDay(value)
  const scope = $derived({
    ...value,
    dayLabel: labelOf(day.date, context.locale, DAY_NUMBER),
    inCurrentPeriod: day.inCurrentPeriod,
    lanes: laneCount(rowContext.row.lanes, rowContext.maxLanes)
  })
</script>

<svelte:element
  this={as}
  data-date={day.date}
  data-in-current-period={day.inCurrentPeriod}
  {...rest}
  style={styleText({}, style)}
  >{#if children}{@render children(
      scope
    )}{:else}{scope.dayLabel}{/if}</svelte:element
>
