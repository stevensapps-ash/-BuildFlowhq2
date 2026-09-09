import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.buildflowhq.app',
  appName: 'BuildFlow HQ',
  webDir: 'public',
  server: {
    url: 'https://build-flowhq2.vercel.app',
    cleartext: false,
    allowNavigation: ['build-flowhq2.vercel.app']
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0b1118'
  },
  android: {
    backgroundColor: '#0b1118',
    allowMixedContent: false
  }
}

export default config
