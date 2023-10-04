import { PropsWithChildren } from 'react'
import styles from './table.module.css'

export default function Table({ children }: PropsWithChildren) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>{children}</table>
    </div>
  )
}
