import {
  EMBED_HEIGHT_MESSAGE,
  EMBED_MEASURE_MESSAGE,
  EMBED_READY_MESSAGE
} from './constants'

export type EmbedHeightMessage = {
  type: typeof EMBED_HEIGHT_MESSAGE
  height: number
}

export type EmbedReadyMessage = {
  type: typeof EMBED_READY_MESSAGE
}

export type EmbedMeasureMessage = {
  type: typeof EMBED_MEASURE_MESSAGE
}

export type EmbedMessage = EmbedHeightMessage | EmbedReadyMessage
