import 'temporal-polyfill/global'

import { provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'

import { AppComponent } from './app/app.component'
import './styles.css'

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()]
}).catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error)
})
