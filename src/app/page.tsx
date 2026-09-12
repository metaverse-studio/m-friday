'use client'

import { useEffect, useState } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { LockScreen } from '@/components/fido/LockScreen'
import { useSession } from '@/lib/session'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const phase = useSession((s) => s.phase)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <LockScreen />
  }

  return phase === 'locked' ? <LockScreen /> : <Dashboard />
}
