import 'temporal-polyfill/global'

import { createApp } from 'vue'

import App from './app/App.vue'
import './styles.css'

const container = document.getElementById('root')

if (container) {
  createApp(App).mount(container)
}
