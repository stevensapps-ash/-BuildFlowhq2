import './globals.css'

export const metadata = {
  title: 'BuildFlow HQ',
  description: 'The operating system for contractors and construction companies.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
