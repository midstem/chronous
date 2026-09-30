import 'temporal-polyfill/global'

import { mount } from 'svelte'
import App from './App.svelte'
import './styles.css'

const container = document.getElementById('root')

if (container) mount(App, { target: container })
