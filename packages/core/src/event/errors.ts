import type { EventId } from './types'

export class InvalidEventError extends Error {
  readonly eventId: EventId

  readonly reason: string

  constructor(eventId: EventId, reason: string, cause?: unknown) {
    super(`Event "${eventId}" ${reason}.`, { cause })

    this.name = 'InvalidEventError'
    this.eventId = eventId
    this.reason = reason
  }
}
