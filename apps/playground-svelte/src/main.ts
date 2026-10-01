import 'temporal-polyfill/global'

import { mount } from 'svelte'
import { startEmbedBridge } from '@midstem/playground-core'
import App from './App.svelte'
import './styles.css'

startEmbedBridge()

const container = document.getElementById('root')

if (container) mount(App, { target: container })
