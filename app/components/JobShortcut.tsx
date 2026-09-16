'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function JobShortcut() {
  const pathname = usePathname()

  // Keep workspace actions off login, signup/subscription, and other public/setup screens.
  // The dashboard is the only place this global shortcut should appear.
  if (pathname !== '/') return null

  return (
    <Link
      href="/jobs"
      aria-label="Start or track a job"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 84,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderRadius: 999,
        background: '#111827',
        color: '#fff',
        fontWeight: 800,
        textDecoration: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,.22)'
      }}
    >
      <Play size={17} /> Start Job
    </Link>
  )
}
