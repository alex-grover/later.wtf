import { ThemeToggle } from '@/components/theme'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <>
      <header className={styles.header}>
        <ThemeToggle />
      </header>
      <main className={styles.main}></main>
    </>
  )
}
