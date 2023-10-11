'use client'

import { useIsMounted } from 'connectkit'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import styles from './theme-toggle.module.css'

export default function ThemeToggle() {
  const isMounted = useIsMounted()
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }, [setTheme, resolvedTheme])

  if (!isMounted) return null

  return (
    <button
      onClick={toggleTheme}
      className={styles.button}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
