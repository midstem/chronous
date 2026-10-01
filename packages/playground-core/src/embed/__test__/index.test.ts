// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  EMBED_HEIGHT_MESSAGE,
  EMBED_MEASURE_MESSAGE,
  EMBED_QUERY_KEY,
  EMBED_READY_MESSAGE,
  isEmbedded,
  startEmbedBridge
} from '../index'

describe('embed bridge', () => {
  const originalLocation = window.location

  beforeEach(() => {
    delete document.documentElement.dataset.embed
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    })
  })

  it('exposes embed message and query constants', () => {
    expect(EMBED_QUERY_KEY).toBe('embed')
    expect(EMBED_READY_MESSAGE).toBe('chronous-playground:ready')
    expect(EMBED_HEIGHT_MESSAGE).toBe('chronous-playground:height')
    expect(EMBED_MEASURE_MESSAGE).toBe('chronous-playground:measure')
  })

  it('detects embedded state when url query contains embed', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?embed'),
      writable: true
    })

    expect(isEmbedded()).toBe(true)
  })

  it('detects not embedded when top-level without query', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/'),
      writable: true
    })

    expect(isEmbedded()).toBe(false)
  })

  it('sets dataset.embed on documentElement when startEmbedBridge runs in embedded state', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?embed'),
      writable: true
    })

    const stop = startEmbedBridge()
    expect(document.documentElement.dataset.embed).toBe('true')
    stop()
  })
})
