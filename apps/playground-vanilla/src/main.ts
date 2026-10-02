import 'temporal-polyfill/global'

import { ROOT_ID, startEmbedBridge } from '@midstem/playground-core'

import { createApp } from './app'
import { createPlaygroundStore } from './playground'
import { createThemeController } from './theme'

import './styles.css'

startEmbedBridge()

const container = document.getElementById(ROOT_ID)

if (container) {
  const store = createPlaygroundStore()
  const theme = createThemeController()
  const app = createApp(store, theme)
  container.appendChild(app)
}
