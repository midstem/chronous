import { capture } from '../shell/index.mjs'

export const readPreviousTag = (name) =>
  capture('git', ['tag', '--list', `${name}@*`, '--sort=-v:refname'])
    .split('\n')
    .filter(Boolean)[0] ?? null
