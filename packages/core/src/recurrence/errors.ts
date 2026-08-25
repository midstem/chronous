import type { EventId } from '#src/event'

export class InvalidRecurrenceError extends Error {
  readonly eventId: EventId

  readonly reason: string

  constructor(eventId: EventId, reason: string, cause?: unknown) {
    super(`Recurrence of event "${eventId}" ${reason}.`, { cause })

    this.name = 'InvalidRecurrenceError'
    this.eventId = eventId
    this.reason = reason
  }
}
