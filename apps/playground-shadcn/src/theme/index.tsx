import { MoonIcon, SunIcon } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'

import { DARK_CLASS, THEME_KEY } from './constants'

const isDark = (): boolean =>
  document.documentElement.classList.contains(DARK_CLASS)

const remember = (dark: boolean): void => {
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  } catch {
    return
  }
}

export const ThemeToggle = (): ReactElement => {
  const [dark, setDark] = useState(isDark)

  const toggle = (): void => {
    const next = !dark
    document.documentElement.classList.toggle(DARK_CLASS, next)
    remember(next)
    setDark(next)
  }

  return (
    <Button
      aria-label={dark ? 'Use light theme' : 'Use dark theme'}
      size="icon-sm"
      type="button"
      variant="ghost"
      onClick={toggle}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
