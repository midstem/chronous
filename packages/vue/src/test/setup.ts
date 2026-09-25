import 'temporal-polyfill/global'
import { afterEach } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
})
