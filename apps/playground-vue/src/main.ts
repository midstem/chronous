import 'temporal-polyfill/global'

import { createApp } from 'vue'
import { startEmbedBridge } from '@midstem/playground-core'

import App from './app/App.vue'
import './styles.css'

startEmbedBridge()

const container = document.getElementById('root')

if (container) {
  createApp(App).mount(container)
}
