import { describe, expect, it } from 'vitest'
import { createPlayground } from '../playground/use-playground'

describe('usePlayground', () => {
  it('initializes with default preset and state', () => {
    const playground = createPlayground()
    expect(playground.state.value.preset).toBe('showcase')
    expect(playground.events.value.length).toBeGreaterThan(0)
    expect(playground.problem.value).toBeNull()
  })

  it('updates state correctly', () => {
    const playground = createPlayground()
    playground.update({ view: 'month' })
    expect(playground.state.value.view).toBe('month')
  })

  it('switches preset', () => {
    const playground = createPlayground()
    playground.choosePreset('overlaps')
    expect(playground.state.value.preset).toBe('overlaps')
    expect(playground.problem.value).toBeNull()
  })

  it('handles invalid source gracefully', () => {
    const playground = createPlayground()
    playground.changeSource('{ invalid json')
    expect(playground.problem.value).not.toBeNull()
  })

  it('resets to initial state', () => {
    const playground = createPlayground()
    playground.update({ view: 'month' })
    playground.reset()
    expect(playground.state.value.view).toBe('week')
    expect(playground.state.value.preset).toBe('showcase')
  })
})
