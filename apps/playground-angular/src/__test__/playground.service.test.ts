import { describe, expect, it } from 'vitest'
import { PlaygroundService } from '../playground/playground.service'

describe('PlaygroundService', () => {
  it('initializes with default preset and state', () => {
    const service = new PlaygroundService()
    expect(service.state().preset).toBe('showcase')
    expect(service.events().length).toBeGreaterThan(0)
    expect(service.problem()).toBeNull()
  })

  it('updates state correctly', () => {
    const service = new PlaygroundService()
    service.update({ view: 'month' })
    expect(service.state().view).toBe('month')
  })

  it('switches preset', () => {
    const service = new PlaygroundService()
    service.choosePreset('overlaps')
    expect(service.state().preset).toBe('overlaps')
    expect(service.problem()).toBeNull()
  })

  it('handles invalid source gracefully', () => {
    const service = new PlaygroundService()
    service.changeSource('{ invalid json')
    expect(service.problem()).not.toBeNull()
  })

  it('resets to initial state', () => {
    const service = new PlaygroundService()
    service.update({ view: 'month' })
    service.reset()
    expect(service.state().view).toBe('week')
    expect(service.state().preset).toBe('showcase')
  })
})
