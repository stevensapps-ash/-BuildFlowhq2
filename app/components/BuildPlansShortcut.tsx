'use client'

import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function BuildPlansShortcut() {
  const pathname = usePathname()

  if (pathname !== '/') return null

  return (
    <Link
      href="/build-plans"
      aria-label="Open AI Build Plans"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderRadius: 14,
        background: '#111827',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 800,
        boxShadow: '0 10px 30px rgba(0,0,0,.22)'
      }}
    >
      <ClipboardList size={18} />
      Build Plans
    </Link>
  )
}
