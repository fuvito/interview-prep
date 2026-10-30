# Publishing to the Chrome Web Store

## Prerequisites

- A Google account
- $5 one-time developer registration fee (paid once per account)
- A production build of the extension

---

## 1. Build the Extension

```bash
npm run prerelease   # run all checks first
npm run build        # produces dist/
```

Create a ZIP of the `dist/` folder:

```bash
# macOS / Linux
zip -r interview-prep-v1.0.0.zip dist/

# Windows (PowerShell)
Compress-Archive -Path dist\* -DestinationPath interview-prep-v1.0.0.zip
```

---

## 2. Create a Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee if prompted

---

## 3. Create a New Item

1. Click **Add new item**
2. Upload the ZIP file you created in step 1
3. Click **Continue**

---

## 4. Fill in Store Listing

### Required

| Field | Notes |
|---|---|
| **Name** | InterviewPrep (max 45 chars) |
| **Short description** | Max 132 characters. Example: *Offline interview prep — TypeScript, Java, Node.js, and more. Study, quiz, track progress. No account needed.* |
| **Detailed description** | Up to 16 000 characters. Use the content from `README.md` as a starting point. |
| **Category** | Education |
| **Language** | English |
| **Screenshots** | At least one 1280×800 or 640×400 PNG/JPEG. Run `node scripts/generate-screenshots.mjs` to generate them. |

### Optional but Recommended

- **Promotional images** — 440×280 small tile. Run `node scripts/generate-store-assets.mjs`.
- **Icon** — 128×128 PNG (already in `public/icons/`).

---

## 5. Privacy Practices

On the **Privacy practices** tab:

- **Single purpose**: helps users prepare for technical interviews
- **Permissions justification**:
  - `storage` — saves user progress and preferences in IndexedDB
- **Data usage**: Select *This extension does not collect or transmit any personal data*
- **Remote code**: Select *No*

---

## 6. Submit for Review

Click **Submit for review**. Chrome Web Store review typically takes **1–3 business days** for new submissions.

---

## 7. After Approval

Once approved you will receive an email. The item becomes publicly listed on the Chrome Web Store. To publish an update:

1. Bump `version` in `manifest.json` and `package.json`
2. Run `npm run prerelease`
3. Run `npm run build` and create a new ZIP
4. Go to the Developer Dashboard → your item → **Package** tab → upload the new ZIP
5. Click **Submit for review**

---

## Useful Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Extension publishing docs](https://developer.chrome.com/docs/webstore/publish/)
- [Store listing best practices](https://developer.chrome.com/docs/webstore/best_practices/)
