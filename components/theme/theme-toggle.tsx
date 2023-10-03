'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import styles from './theme-toggle.module.css'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }, [setTheme, resolvedTheme])

  if (!mounted) return null

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
