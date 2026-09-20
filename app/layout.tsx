import './globals.css'

export const metadata = {
  title: 'Construction HQ',
  description: 'The operating system for contractors and construction companies.',
  manifest: '/manifest.webmanifest',
  themeColor: '#1d252b',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
