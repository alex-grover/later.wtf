'use client'

import { type Signer } from 'neynar-next/server'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export type NeynarContextType = {
  signer: Signer | null
  fetchSigner: () => void
  clearSigner: () => void
  isLoading: boolean
  signIn: () => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/require-await
async function notInitialized() {
  throw new Error('Not initialized')
}

const NeynarContext = createContext<NeynarContextType>({
  signer: null,
  fetchSigner: () => 0,
  clearSigner: () => 0,
  isLoading: true,
  signIn: notInitialized,
})

export default function NeynarProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true)
  const [signer, setSigner] = useState<Signer | null>(null)

  const fetchSigner = useCallback(() => {
    async function execute() {
      setIsLoading(true)
      const response = await fetch('/api/signer')

      if ([401, 404].includes(response.status)) {
        setSigner(null)
        setIsLoading(false)
        return
      }

      const newSigner = (await response.json()) as Signer
      setSigner(newSigner)
      setIsLoading(false)
    }

    void execute()
  }, [])

  // Fetch signer from backend on page load
  useEffect(() => {
    fetchSigner()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll for updates while signer is in pending status
  useEffect(() => {
    if (signer?.status !== 'pending_approval') return

    let intervalId: NodeJS.Timeout

    const startPolling = () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      intervalId = setInterval(async () => {
        const response = await fetch('/api/signer')

        const updatedSigner = (await response.json()) as Signer
        if (updatedSigner.status !== 'approved') return

        setSigner(updatedSigner)
        clearInterval(intervalId)
      }, 2000)
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        startPolling()
      } else {
        clearInterval(intervalId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    startPolling()

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [signer])

  const signIn = useCallback(async () => {
    setSigner(null)

    const response = await fetch('/api/signer', { method: 'POST' })
    const signer = (await response.json()) as Signer

    setSigner(signer)
  }, [])

  const clearSigner = useCallback(() => {
    setSigner(null)
  }, [])

  return (
    <NeynarContext.Provider
      value={{ signer, fetchSigner, clearSigner, isLoading, signIn }}
    >
      {children}
    </NeynarContext.Provider>
  )
}

export function useSigner() {
  return useContext(NeynarContext)
}
