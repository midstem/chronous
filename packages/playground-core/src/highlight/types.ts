export type CodeTokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'keyword'
  | 'number'
  | 'tag'
  | 'attribute'
  | 'function'
  | 'punctuation'

export type CodeToken = {
  text: string
  kind: CodeTokenKind
}

export type Cursor = {
  source: string
  pos: number
  last: string
  tokens: CodeToken[]
}

export type CodeStop = 'none' | 'brace'
