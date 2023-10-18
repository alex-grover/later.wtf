import { ThemeToggle } from '@/components/theme'
import { ConnectButton } from '@/lib/connectkit'
import AddSignerDialog from './add-signer-dialog'
import Casts from './casts'
import CreateForm from './create-form'
import styles from './page.module.css'

export const runtime = 'nodejs'

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
        <AddSignerDialog />
        <CreateForm />
        <Casts />
      </main>
    </>
  )
}
