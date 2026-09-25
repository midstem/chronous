import type { Component, VNode } from 'vue'
import { createApp, h } from 'vue'

export const mount = (
  component: Component | (() => VNode),
  options: { props?: Record<string, any>; slots?: Record<string, any> } = {}
): { container: HTMLElement; unmount: () => void } => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = {
    render() {
      return typeof component === 'function' && !('setup' in component)
        ? (component as () => VNode)()
        : h(component, options.props, options.slots)
    }
  }

  const app = createApp(root)
  app.mount(container)

  return {
    container,
    unmount() {
      app.unmount()
      container.remove()
    }
  }
}
