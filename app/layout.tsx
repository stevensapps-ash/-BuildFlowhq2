import './globals.css'

export const metadata = {
  title: 'BuildFlow HQ',
  description: 'The operating system for contractors and construction companies.',
  manifest: '/manifest.webmanifest',
  themeColor: '#f4a622',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BuildFlow HQ'
  },
  icons: {
    icon: '/buildflow-icon.svg',
    apple: '/buildflow-icon.svg'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
