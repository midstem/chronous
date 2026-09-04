import { provideZonelessChangeDetection } from '@angular/core'
import type { Type } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { ComponentFixture } from '@angular/core/testing'

export const mount = <THost>(host: Type<THost>): ComponentFixture<THost> => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()]
  })

  const fixture = TestBed.createComponent(host)

  fixture.detectChanges()

  return fixture
}

export const allOf = <THost>(
  fixture: ComponentFixture<THost>,
  testId: string
): HTMLElement[] => {
  const host = fixture.nativeElement as HTMLElement

  return Array.from(host.querySelectorAll(`[data-testid="${testId}"]`))
}

export const oneOf = <THost>(
  fixture: ComponentFixture<THost>,
  testId: string
): HTMLElement => allOf(fixture, testId)[0]

export const styleOf = (element: HTMLElement): string =>
  element.getAttribute('style') ?? ''

export const textOf = (element: HTMLElement): string =>
  (element.textContent ?? '').trim()
