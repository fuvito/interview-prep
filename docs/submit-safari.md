# Publishing to the Safari App Store

Safari Web Extensions are distributed through the Mac App Store (and iOS App Store). They require wrapping in a native app container using Xcode.

## Prerequisites

- macOS (required — Xcode only runs on macOS)
- Xcode 14+ (free from the Mac App Store)
- Apple Developer Program membership ($99/year)
- A production build of the extension

---

## 1. Build the Extension

```bash
npm run prerelease
npm run build
```

---

## 2. Convert the Extension with Xcode

Apple provides a command-line tool that converts a Chrome/MV3 extension into a Safari Web Extension Xcode project.

```bash
xcrun safari-web-extension-converter dist/ \
  --project-location ./safari-app \
  --app-name "InterviewPrep" \
  --bundle-identifier com.fuvito.interview-prep \
  --swift
```

This creates a new Xcode project at `./safari-app/` containing:
- A macOS app target
- An iOS app target (optional)
- The Safari Web Extension target with your `dist/` files embedded

> Run this command again each time you do a new build to refresh the extension files.

---

## 3. Configure the Xcode Project

Open the generated `.xcodeproj` in Xcode:

1. Select the app target and set the **Bundle Identifier** (e.g., `com.fuvito.interview-prep`)
2. Set the **Version** to match `manifest.json` (e.g., `1.0.0`) and **Build** to `1`
3. Set the **Team** to your Apple Developer account under **Signing & Capabilities**
4. Repeat for the extension target

### App Store metadata (minimum)

- **App icon** — 1024×1024 PNG (no alpha channel). Run `node scripts/generate-store-assets.mjs` to generate `store-assets/icon-1024-appstore.png`. Apple applies the rounded-corner mask itself — the icon must be square with no transparency.
- **Screenshots** — at least one per platform. The existing 1280×800 screenshots in `store-assets/` are an accepted Mac App Store size. Run `node scripts/generate-screenshots.mjs` to regenerate them.

---

## 4. Test in Safari

1. In Xcode, select the macOS scheme and click **Run** (⌘R)
2. The app launches and installs the extension
3. Open Safari → **Settings** → **Extensions** and enable **InterviewPrep**
4. Click the extension icon in the Safari toolbar to open the popup

---

## 5. Archive and Upload

1. In Xcode, select **Product → Archive** (make sure the macOS scheme is selected, not a simulator)
2. The **Organizer** window opens when the archive completes
3. Click **Distribute App** → **App Store Connect** → **Upload**
4. Follow the prompts; Xcode validates and uploads the build

---

## 6. Submit in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **+** next to macOS App (or iOS App)
3. Select the build you just uploaded
4. Fill in:
   - **Name**: InterviewPrep
   - **Subtitle**: Offline Technical Interview Prep
   - **Description**: full description
   - **Keywords**: interview, typescript, java, programming, quiz
   - **Support URL** and **Privacy Policy URL**
   - Screenshots (at least one per device size)
5. Under **App Review Information**, note that the app requires no special setup
6. Click **Submit for Review**

App Store review typically takes **1–3 business days**.

---

## Notes

- Safari Web Extensions have the same capability restrictions as Chrome MV3 extensions — Manifest V3 is supported from Safari 15.4+
- The minimum macOS deployment target should be set to **macOS 12 (Monterey)** or later
- IndexedDB is fully supported in Safari Web Extensions
- `fetch` in service workers is supported from Safari 16+

---

## Useful Links

- [Safari Web Extensions overview (Apple)](https://developer.apple.com/safari/extensions/)
- [Converting to Safari Web Extension](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Program](https://developer.apple.com/programs/)
