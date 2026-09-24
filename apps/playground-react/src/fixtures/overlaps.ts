import type { EventInput } from '@midstem/chronous-react'

import type { EventData } from '../types'

export const OVERLAPS: readonly EventInput<EventData>[] = [
  {
    id: 'kickoff',
    start: '2026-03-24T09:00:00',
    end: '2026-03-24T12:00:00',
    data: { title: 'Kickoff' }
  },
  {
    id: 'design',
    start: '2026-03-24T09:30:00',
    end: '2026-03-24T11:00:00',
    data: { title: 'Design' }
  },
  {
    id: 'backend',
    start: '2026-03-24T10:00:00',
    end: '2026-03-24T10:45:00',
    data: { title: 'Backend' }
  },
  {
    id: 'triage',
    start: '2026-03-24T10:30:00',
    end: '2026-03-24T13:00:00',
    data: { title: 'Triage' }
  },
  {
    id: 'lunch',
    start: '2026-03-24T12:30:00',
    end: '2026-03-24T13:30:00',
    data: { title: 'Lunch' }
  },
  {
    id: 'retro',
    start: '2026-03-24T13:00:00',
    end: '2026-03-24T14:00:00',
    data: { title: 'Retro' }
  },
  {
    id: 'demo',
    start: '2026-03-24T13:15:00',
    end: '2026-03-24T13:45:00',
    data: { title: 'Demo' }
  },
  {
    id: 'onboarding',
    start: '2026-03-24T14:00:00',
    end: '2026-03-24T17:00:00',
    data: { title: 'Onboarding' }
  },
  {
    id: 'pairing',
    start: '2026-03-24T15:00:00',
    end: '2026-03-24T16:00:00',
    data: { title: 'Pairing' }
  },
  {
    id: 'handover',
    start: '2026-03-24T15:30:00',
    end: '2026-03-24T18:00:00',
    data: { title: 'Handover' }
  }
]
