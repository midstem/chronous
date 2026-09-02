import { MISSING_TEMPORAL_MESSAGE } from './constants'

export class MissingTemporalError extends Error {
  constructor(cause?: unknown) {
    super(MISSING_TEMPORAL_MESSAGE, { cause })

    this.name = 'MissingTemporalError'
  }
}
