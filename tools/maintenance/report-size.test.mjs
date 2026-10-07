import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatReport, measureCode } from './report-size.mjs'

const metric = (bytes, gzipBytes) => ({ bytes, gzipBytes })

describe('package size reports', () => {
  it('reports finite bundle metrics and gzip deltas', () => {
    // Given measurements from current and baseline builds
    const baseline = { metrics: { core: metric(120, 60) } }
    const current = { metrics: { core: metric(130, 65) } }

    // When rendered, then the report shows exact finite byte deltas
    const report = formatReport(current, baseline)
    assert.match(
      report,
      /\| core \| 65 B gzip \(130 B minified\) \| \+5 B gzip \(\+8\.3%\) \|/
    )
  })

  it('computes finite numeric sizes from bundle text', () => {
    const measured = measureCode('export const ready = true')
    assert.equal(Number.isFinite(measured.bytes), true)
    assert.equal(Number.isFinite(measured.gzipBytes), true)
    assert.equal(measured.bytes, 25)
  })

  it('labels packages without a baseline as new and formats no-baseline reports', () => {
    // Given a baseline that predates the Svelte measurement
    const current = {
      metrics: { core: metric(130, 65), svelteClient: metric(800, 300) }
    }
    const baseline = { metrics: { core: metric(120, 60) } }

    // When rendered, then the package is marked new without an artificial delta
    assert.match(
      formatReport(current, baseline),
      /svelteClient \| 300 B gzip \(800 B minified\) \| New package/
    )
    assert.match(
      formatReport(current),
      /\| core \| 65 B gzip \(130 B minified\) \| — \|/
    )
  })

  it('handles a zero-byte baseline without producing an infinite percentage', () => {
    const current = { metrics: { core: metric(10, 4) } }
    const baseline = { metrics: { core: metric(0, 0) } }
    assert.match(formatReport(current, baseline), /\+4 B gzip \(baseline 0 B\)/)
    assert.doesNotMatch(formatReport(current, baseline), /Infinity/)
  })
})
