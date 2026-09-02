import { MAIN_BRANCH } from '../../constants.mjs'
import { capture } from '../shell/index.mjs'

import { CORE_LOCATION, CORE_PACKAGE } from './constants.mjs'

const generateNotes = ({ previousTag, location }) => {
  if (!previousTag) return ''

  const paths = [location]

  if (location !== CORE_LOCATION) paths.push(CORE_LOCATION)

  const lines = capture('git', [
    'log',
    `${previousTag}..HEAD`,
    '--format=* %s',
    '--',
    ...paths
  ])
    .split('\n')
    .filter((line) => line !== '' && !line.includes('update version of'))

  if (!lines.length) {
    return location === CORE_LOCATION
      ? ''
      : `Rebuilt with the latest \`${CORE_PACKAGE}\` engine.`
  }

  return lines.join('\n')
}

export const buildArgs = ({ tag, previousTag, location, note, prerelease }) => {
  const changes = generateNotes({ previousTag, location })
  const body = [note, changes].filter(Boolean).join('\n\n')

  const args = [
    'release',
    'create',
    tag,
    '--target',
    MAIN_BRANCH,
    '--title',
    tag,
    '--notes',
    body || 'Maintenance release.'
  ]

  if (prerelease) args.push('--prerelease')

  return args
}

export const summary = ({
  entry,
  tag,
  previousTag,
  note,
  prerelease,
  head
}) => {
  const scope =
    entry.location !== CORE_LOCATION
      ? `${entry.location} + ${CORE_LOCATION}`
      : entry.location

  return [
    `  tag         ${tag}`,
    `  target      ${MAIN_BRANCH} (${head})`,
    `  notes       changes in ${scope} since ${previousTag ?? 'the first commit'}${note ? ', under your line' : ''}`,
    `  npm         ${entry.name}@${entry.version} on the ${prerelease ? 'next' : 'latest'} dist-tag`
  ]
}
