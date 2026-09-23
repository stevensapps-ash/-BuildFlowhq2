import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Construction HQ',
  description: 'The operating system for contractors and construction companies.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Construction HQ'
  },
  icons: {
    icon: '/buildflow-icon.svg',
    apple: '/buildflow-icon.svg'
  }
}

export const viewport: Viewport = {
  themeColor: '#1d252b'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
