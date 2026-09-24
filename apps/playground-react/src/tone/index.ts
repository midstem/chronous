import { DOTS, HASH_SEED, HASH_STEP, TONES } from './constants'

const hashOf = (id: string): number => {
  let hash = HASH_SEED

  for (let index = 0; index < id.length; index += 1)
    hash = (hash * HASH_STEP + id.charCodeAt(index)) % TONES.length

  return hash
}

export const toneOf = (id: string): string => TONES[hashOf(id)]

export const dotOf = (id: string): string => DOTS[hashOf(id)]
