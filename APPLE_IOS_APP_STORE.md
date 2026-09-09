# 🍎 APPLE iOS — APP STORE

This file is ONLY for the iPhone/iPad release of BuildFlow HQ.

## Build the iOS app
```bash
npm install
npm run mobile:add:ios
npm run mobile:sync
npm run mobile:open:ios
```

## Open in
Xcode on a Mac.

## Store destination
Apple App Store / App Store Connect.

## App identity
- Name: BuildFlow HQ
- Bundle ID: `com.buildflowhq.app`
- Platform: iOS

## Release output
Archive the app in Xcode and upload the signed build to App Store Connect.

## What is still required from the owner
- Apple Developer account
- Apple signing team/certificate managed through Xcode
- App Store Connect listing details
- Screenshots and privacy information

Do not store Apple certificates, signing keys, or passwords in GitHub.
