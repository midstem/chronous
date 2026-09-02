import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'
import { Boundary } from './boundary'
import { ROOT_ID } from './constants'

import './styles.css'

const container = document.getElementById(ROOT_ID)

if (container)
  createRoot(container).render(
    <StrictMode>
      <Boundary>
        <App />
      </Boundary>
    </StrictMode>
  )
