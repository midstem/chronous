import 'temporal-polyfill/global'

import '@angular/compiler'
import { TestBed, getTestBed } from '@angular/core/testing'
import {
  BrowserTestingModule,
  platformBrowserTesting
} from '@angular/platform-browser/testing'
import { afterEach } from 'vitest'

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting())

afterEach(() => {
  TestBed.resetTestingModule()
})
