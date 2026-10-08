export const SITE_URL = 'https://chronous.midstem.net'

export const DOCS_HOME_URL = `${SITE_URL}/docs/`

export const DOCS_LINKS = [
  {
    title: 'Get Started',
    href: DOCS_HOME_URL,
    description:
      'One package, no stylesheet and no setup — install it, describe the range and draw your first week.'
  },
  {
    title: 'Guides',
    href: `${SITE_URL}/docs/guides/events/`,
    description:
      'Events, recurrence, views, lanes and server rendering — one topic at a time, with the reasoning behind it.'
  },
  {
    title: 'API reference',
    href: `${SITE_URL}/docs/api/calendar/`,
    description:
      'Every component, hook and type, with its props, its defaults and the scope it hands to its children.'
  },
  {
    title: 'Examples',
    href: `${SITE_URL}/docs/examples/week/`,
    description:
      'A week, a month and an agenda running live — each beside the file and the stylesheet that produced it.'
  }
] as const
