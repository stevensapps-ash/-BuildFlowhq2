# BuildFlow HQ Mobile Release

BuildFlow HQ is prepared to be wrapped as native mobile apps with Capacitor.

## 🍎 APPLE iOS / APP STORE

Use these files and commands for the iPhone/iPad version.

### Create the iOS project
```bash
npm install
npm run mobile:add:ios
npm run mobile:sync
npm run mobile:open:ios
```

### Final Apple release file
The Apple App Store upload is created from Xcode as an `.ipa` / App Store archive.

### Apple identifiers
- App name: BuildFlow HQ
- Bundle ID: `com.buildflowhq.app`
- Platform: iOS / iPhone / iPad
- Store: Apple App Store

---

## 🤖 ANDROID / GOOGLE PLAY

Use these files and commands for the Android version.

### Create the Android project
```bash
npm install
npm run mobile:add:android
npm run mobile:sync
npm run mobile:open:android
```

### Final Google release file
Google Play normally receives an Android App Bundle: `.aab`.

### Google identifiers
- App name: BuildFlow HQ
- Application ID: `com.buildflowhq.app`
- Platform: Android
- Store: Google Play Store

---

## IMPORTANT

The mobile apps load the live BuildFlow HQ application at:
`https://build-flowhq2.vercel.app`

This means the same BuildFlow account, Supabase workspace, and production features are shared across web, iPhone, and Android.

Store signing and publishing still require the owner's Apple Developer and Google Play Console accounts. Never commit private signing keys, certificates, or store passwords to GitHub.
