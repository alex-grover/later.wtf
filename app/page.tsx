import { ThemeToggle } from '@/components/theme'
import { ConnectButton } from '@/lib/connectkit'
import Casts from './casts'
import CreateForm from './create-form'
import LoginDialog from './login-dialog'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <>
      <header className={styles.header}>
        <h1>later.wtf</h1>
        <div className={styles.connect}>
          <ConnectButton />
          <ThemeToggle />
        </div>
      </header>
      <main className={styles.main}>
        <CreateForm />
        <Casts />
      </main>
      <LoginDialog />
    </>
  )
}
