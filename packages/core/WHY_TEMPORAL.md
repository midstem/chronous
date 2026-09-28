# Why does a calendar need Temporal?

**`Date` is enough to display a known UTC instant. Temporal matters when the calendar must calculate an instant from a rule such as “every Monday at 09:00 in Berlin.”** The rule describes a _local clock time_, not a fixed number of hours after the first meeting.

## The clearest examples

### 1. Every Monday at 09:00 in Berlin

```ts
{
  start: '2026-03-23T09:00:00',
  timeZone: 'Europe/Berlin',
  recurrence: { rule: 'FREQ=WEEKLY;BYDAY=MO' }
}
```

| Meeting          | Berlin clock      | UTC instant |
| ---------------- | ----------------- | ----------- |
| Monday, March 23 | **09:00** (UTC+1) | 08:00Z      |
| Monday, March 30 | **09:00** (UTC+2) | 07:00Z      |

```text
Calendar rule:  Mar 23, 09:00 Berlin ── next Monday at 09:00 ──▶ Mar 30, 09:00 Berlin ✓
UTC shortcut:   Mar 23, 08:00Z        ── add 168 hours ──────────▶ Mar 30, 08:00Z = 10:00 Berlin ✗
```

The calendar must choose the next _Berlin date and 09:00_, then find its UTC instant. Temporal provides the time-zone operation; Chronous applies the weekly rule. **Temporal does not implement `RRULE` by itself.**

### 2. A holiday is a date, not a UTC midnight

A holiday on **January 1** should stay on January 1 for everyone.

| Representation                      | What someone in Los Angeles sees |
| ----------------------------------- | -------------------------------- |
| `new Date('2026-01-01')`            | December 31, 2025 at 16:00       |
| A date without a time: `2026-01-01` | **January 1, 2026**              |

`Date` parses that date-only string as midnight UTC. Chronous uses a date-only value for an all-day event; Temporal's `PlainDate` keeps it separate from a UTC instant.

### 3. “Tomorrow at 09:00” is different from “in 24 hours”

Start in New York on **March 7, 2026 at 09:00**, just before the clocks move forward.

| Request                       | March 8 result        |
| ----------------------------- | --------------------- |
| Add one calendar day: `P1D`   | **09:00** in New York |
| Add exactly 24 hours: `PT24H` | **10:00** in New York |

`date.getTime() + 86_400_000` can only express the second calculation. Temporal distinguishes calendar units from elapsed hours, so Chronous can apply the duration the event actually specifies.

## Seven more calendar cases

| #   | Situation                                                                              | What goes wrong with a simple `Date` calculation                                                                      | What the calendar needs                                                                                                                             |
| --- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | **A missing hour.** New York, March 8, 2026 at 02:30.                                  | That clock time never occurs. A local `Date` constructor silently picks a result in the _device's_ zone.              | Resolve it in the **event's** zone. Temporal lets Chronous choose `earlier` (01:30), `later` (03:30), or `reject`.                                  |
| 5   | **A repeated hour.** New York, November 1, 2026 at 01:30.                              | It can mean **05:30Z or 06:30Z**. The wall time alone cannot identify one instant.                                    | An explicit `earlier`, `later`, or `reject` policy.                                                                                                 |
| 6   | **Organizer and viewer use different zones.** A New York meeting stays at 09:00 there. | It appears in Berlin at **15:00 on March 2**, but **14:00 on March 16**. Repeating it at the viewer's 15:00 is wrong. | Expand the series in `event.timeZone`; convert each result to `range.timeZone` for display.                                                         |
| 7   | **A clock change is 30 minutes.** October 4, 2026 in `Australia/Lord_Howe`.            | Assuming every transition is one hour gives the wrong day length and grid positions.                                  | Ask for the actual length of that local day: **23.5 hours**.                                                                                        |
| 8   | **Add a calendar month.** January 31, 2026 + one month.                                | `Date#setUTCMonth()` overflows to **March 3**.                                                                        | A stated calendar policy. `Temporal.PlainDate.add({ months: 1 })` gives **February 28** by default. This is date arithmetic, not an `RRULE` result. |
| 9   | **Repeat on February 29.** `FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=29`.                      | Adding 365 days drifts; simply adding one calendar year would produce February 28.                                    | The recurrence engine skips nonexistent dates: **2024, then 2028**. Temporal supplies calendar dates; Chronous applies `RRULE`.                     |
| 10  | **Cancel one local occurrence.** New York, July 6 at 00:30.                            | In Los Angeles it is still **July 5 at 21:30**. Filtering by the viewer's date could cancel the wrong occurrence.     | Match `exceptions` and `overrides` against the occurrence in the series' zone, then display it in the viewer's zone.                                |

## When is `Date` + `Intl` enough?

**Yes:** if your database already provides the exact UTC instant for a _one-off_ event, `Date` and `Intl.DateTimeFormat` can show that instant in any viewer's zone. The same applies if your server has already expanded **every** occurrence into UTC instants and the client only displays them. The server still needs to calculate those occurrences correctly.

The meaning of a Chronous input depends on what is supplied:

| Input                                                            | Meaning                                                                                                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start: '2026-03-18T07:00:00Z'`, no `recurrence`                 | A known UTC instant. `Date` + `Intl` is sufficient for display.                                                                                            |
| `start: '2026-03-18T09:00:00'`, no `event.timeZone`              | **09:00 in `range.timeZone`**. Omitting `event.timeZone` does **not** silently mean UTC.                                                                   |
| An event with `recurrence`, no `event.timeZone`                  | Repeat by the wall clock in `range.timeZone`. Even if its initial `start` contains `Z`, that UTC value is an anchor, not a promise of a fixed UTC cadence. |
| An event with `recurrence` and `event.timeZone: 'Europe/Berlin'` | Repeat by the Berlin wall clock; display instances in `range.timeZone`.                                                                                    |

A useful storage model is: **UTC instant** for a one-off appointment; **local time + named time zone + rule** for a series; **date only** for an all-day event. You can also store computed UTC instants for notifications or search. Converting those instants for a viewer does not reconstruct the organizer's original rule.

You _can_ implement all of these rules using `Date`, `Intl`, and enough custom time-zone and calendar logic. Temporal is valuable because it makes these different meanings and operations explicit instead of requiring Chronous to maintain that entire date-time engine itself.

## Browser support

Without native Temporal or an application-provided global polyfill, Chronous uses an automatic `Date`/`Intl` fallback and warns in the console. The calendar remains usable, but recurrence and clock-transition calculations can be approximate. The public API does not change when Temporal becomes available. See [browser behavior](DOCUMENTATIONS.md#browser-behavior).

## Sources

- [Temporal: wall-clock time, exact time, and ambiguous hours](https://tc39.es/proposal-temporal/docs/timezone.html)
- [Temporal `ZonedDateTime`: time zones and day length](https://tc39.es/proposal-temporal/docs/zoneddatetime.html)
- [Temporal `PlainDate`: dates and calendar arithmetic](https://tc39.es/proposal-temporal/docs/plaindate.html)
- [MDN: `Date` and date-only string parsing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [RFC 5545: recurrence rules and invalid dates](https://www.rfc-editor.org/rfc/rfc5545)
