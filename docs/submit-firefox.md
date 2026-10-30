# Publishing to Firefox Add-ons (AMO)

Firefox supports Manifest V3 but has some differences from Chrome. This guide covers both adaptation and submission.

## Prerequisites

- A Firefox account (free)
- Node.js 20+
- Firefox installed for local testing

---

## 1. Adapt the Manifest for Firefox

Firefox MV3 requires a few additions to `public/manifest.json`.

Add a `browser_specific_settings` block:

```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "interview-prep@fuvito.com",
      "strict_min_version": "109.0"
    }
  }
}
```

> Firefox requires an explicit extension ID for signing. Use a unique email-style string.

### Known Differences

| Feature | Chrome | Firefox |
|---|---|---|
| `chrome.*` API | native | polyfill needed (`webextension-polyfill`) |
| `service_worker` | supported | supported in MV3 (FF 109+) |
| `host_permissions` | supported | supported |
| IndexedDB | supported | supported |

The codebase uses only `chrome.storage` via Dexie (IndexedDB), which works natively in Firefox. No API polyfill is needed unless `chrome.*` APIs are called directly.

---

## 2. Build

```bash
npm run build
```

Create a ZIP of the `dist/` folder:

```bash
# macOS / Linux
zip -r interview-prep-firefox-v1.0.0.zip dist/

# Windows (PowerShell)
Compress-Archive -Path dist\* -DestinationPath interview-prep-firefox-v1.0.0.zip
```

Firefox AMO also requires a ZIP of the **source code** for review:

```bash
# macOS / Linux  
zip -r interview-prep-source-v1.0.0.zip . \
  --exclude "node_modules/*" --exclude "dist/*" --exclude ".git/*"

# Windows (PowerShell)
Get-ChildItem -Exclude node_modules,dist,.git | Compress-Archive -DestinationPath interview-prep-source-v1.0.0.zip
```

---

## 3. Test Locally in Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click **This Firefox** in the left sidebar
3. Click **Load Temporary Add-on…**
4. Select any file inside your `dist/` folder (e.g., `manifest.json`)
5. The extension loads temporarily — it will be removed when Firefox restarts

---

## 4. Create a Firefox Account and Submit

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in or create an account (free)
3. Click **Submit a New Add-on**
4. Choose **On this site** (publicly listed)
5. Upload the extension ZIP
6. When prompted, upload the **source code ZIP** as well (required for review)

---

## 5. Fill in Listing Details

| Field | Notes |
|---|---|
| **Name** | InterviewPrep |
| **Summary** | Max 250 characters |
| **Description** | Full description using Markdown or plain text |
| **Category** | Education |
| **Screenshots** | At least one PNG between 500×375 and 3840×2400. Run `node scripts/generate-screenshots.mjs` — the generated 1280×800 images in `store-assets/` are accepted by AMO. |
| **Support email** | Your contact email |
| **Build instructions** | `npm install && npm run build` — include this in the source submission notes |

---

## 6. Review Process

AMO review can take **1–10 days** for new submissions. Listed add-ons go through human review. Self-hosted add-ons can be signed automatically (faster) but won't appear in the AMO directory.

---

## Useful Links

- [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
- [Firefox MV3 migration guide](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/)
- [Extension Workshop](https://extensionworkshop.com/)
