const SCROLLS = ['auto', 'scroll', 'overlay']

const scrolls = (node: Element): boolean => {
  const { overflowY } = window.getComputedStyle(node)

  return SCROLLS.includes(overflowY) && node.scrollHeight > node.clientHeight
}

export const scrollerOf = (from: Element | null): Element | null => {
  let node = from

  while (node) {
    if (scrolls(node)) return node

    node = node.parentElement
  }

  return null
}
