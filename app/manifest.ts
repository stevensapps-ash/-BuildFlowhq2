import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BuildFlow HQ',
    short_name: 'BuildFlow',
    description: 'The operating system for contractors and construction companies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6f8',
    theme_color: '#f4a622',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/buildflow-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  }
}
