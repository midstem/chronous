<script lang="ts">
  import type { CalendarRange, EventInput } from '../../src/engine.js'
  import { Calendar, createCalendarComponents } from '../../src'
  type Data = { title: string }
  let {
    range,
    events,
    navigate = () => {},
    locale = 'en-GB',
    minLanes = 1,
    maxLanes = 1,
    laneHeight = 20,
    hourHeight = 60,
    scrollToHour = 7
  }: {
    range: CalendarRange
    events: readonly EventInput<Data>[]
    navigate?: (range: CalendarRange) => void
    locale?: string
    minLanes?: number
    maxLanes?: number | null
    laneHeight?: number
    hourHeight?: number
    scrollToHour?: number | null
  } = $props()
  const TypedCalendar = createCalendarComponents<Data>()
</script>

<TypedCalendar.Root {range} {events} {locale}>
  {#snippet children()}
    <Calendar.Toolbar onNavigate={navigate} />
    <Calendar.DayHeadings />
    <Calendar.AllDayRow {minLanes} class="weekly-row">
      {#snippet children()}
        <Calendar.AllDayEvents class="weekly-all-day" />
      {/snippet}
    </Calendar.AllDayRow>
    <Calendar.TimeGrid {hourHeight} {scrollToHour}>
      {#snippet children()}
        <Calendar.TimeAxis>
          {#snippet children()}
            <Calendar.TimeLabels />
          {/snippet}
        </Calendar.TimeAxis>
        <Calendar.DayColumns>
          {#snippet children()}
            <Calendar.TimeSlots />
            <TypedCalendar.TimedEvents>
              {#snippet children({ event })}
                <span class="timed-title">{event.data?.title}</span>
              {/snippet}
            </TypedCalendar.TimedEvents>
            <Calendar.NowMarker />
          {/snippet}
        </Calendar.DayColumns>
      {/snippet}
    </Calendar.TimeGrid>
    <Calendar.MonthGrid>
      {#snippet children()}
        <Calendar.MonthWeekdays />
        <Calendar.MonthRows {maxLanes} {laneHeight}>
          {#snippet children()}
            <Calendar.MonthAllDayEvents />
            <Calendar.MonthDays>
              {#snippet children({ day, hiddenBars })}
                <span class="month-date">{day.date}</span>
                <span class="hidden-count">{hiddenBars.length}</span>
                <Calendar.MonthTimedEvents />
              {/snippet}
            </Calendar.MonthDays>
          {/snippet}
        </Calendar.MonthRows>
      {/snippet}
    </Calendar.MonthGrid>
    <Calendar.AgendaList>
      {#snippet children()}
        <Calendar.AgendaDays showEmptyDays>
          {#snippet children({ day })}
            <span class="agenda-date">{day.date}</span>
            <Calendar.AgendaAllDayEvents />
            <Calendar.AgendaTimedEvents />
          {/snippet}
        </Calendar.AgendaDays>
      {/snippet}
    </Calendar.AgendaList>
  {/snippet}
  {#snippet renderError(error)}
    <output class="calendar-error">{error.name}</output>
  {/snippet}
</TypedCalendar.Root>
