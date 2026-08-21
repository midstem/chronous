export class InvalidRangeError extends Error {
  readonly reason: string

  constructor(reason: string, cause?: unknown) {
    super(`Invalid range: ${reason}.`, { cause })

    this.name = 'InvalidRangeError'
    this.reason = reason
  }
}
