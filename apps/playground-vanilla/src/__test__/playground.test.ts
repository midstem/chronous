import { describe, expect, it } from 'vitest'

import { createPlaygroundStore } from '../playground'

describe('PlaygroundStore', () => {
  it('initializes with default preset and state', () => {
    const store = createPlaygroundStore()
    expect(store.getState().preset).toBe('showcase')
    expect(store.getEvents().length).toBeGreaterThan(0)
    expect(store.getProblem()).toBeNull()
    expect(store.getMode()).toBe('calendar')
  })

  it('updates state correctly', () => {
    const store = createPlaygroundStore()
    store.update({ view: 'month' })
    expect(store.getState().view).toBe('month')
  })

  it('switches preset', () => {
    const store = createPlaygroundStore()
    store.choosePreset('overlaps')
    expect(store.getState().preset).toBe('overlaps')
    expect(store.getProblem()).toBeNull()
  })

  it('handles invalid source gracefully', () => {
    const store = createPlaygroundStore()
    store.changeSource('{ invalid json')
    expect(store.getProblem()).not.toBeNull()
  })

  it('resets to initial state', () => {
    const store = createPlaygroundStore()
    store.update({ view: 'month' })
    store.reset()
    expect(store.getState().view).toBe('week')
    expect(store.getState().preset).toBe('showcase')
  })

  it('changes mode correctly', () => {
    const store = createPlaygroundStore()
    expect(store.getMode()).toBe('calendar')
    store.setMode('code')
    expect(store.getMode()).toBe('code')
  })
})
