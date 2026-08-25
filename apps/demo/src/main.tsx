import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'
import { Boundary } from './boundary'
import { ROOT_ID } from './constants'
import { installTemporal } from './runtime'

import './styles.css'

const container = document.getElementById(ROOT_ID)

const start = async (): Promise<void> => {
  await installTemporal()

  if (container)
    createRoot(container).render(
      <StrictMode>
        <Boundary>
          <App />
        </Boundary>
      </StrictMode>
    )
}

void start()
