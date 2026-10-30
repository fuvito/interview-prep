# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.test.ts >> Navigation >> navigates to Bookmarks view
- Location: e2e\app.test.ts:48:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Bookmarks')
Expected: visible
Error: strict mode violation: getByText('Bookmarks') resolved to 3 elements:
    1) <h1 class="text-sm font-semibold text-gray-100 truncate">Bookmarks</h1> aka getByRole('heading', { name: 'Bookmarks' })
    2) <p class="text-gray-300 font-medium">No bookmarks</p> aka getByText('No bookmarks')
    3) <button class="flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors↵              text-blue-400">…</button> aka getByRole('button', { name: 'Bookmarks' })

Call log:
  - Expect "toBeVisible" getByText('Bookmarks') with timeout 5000ms
  - waiting for getByText('Bookmarks')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - heading "Bookmarks" [level=1] [ref=e6]
    - generic [ref=e7]:
      - button "Decrease font size" [ref=e8]: A
      - button "Increase font size" [ref=e9]: A
      - button "Toggle theme" [ref=e10]
      - button "Open in full window" [ref=e17]
  - main [ref=e23]:
    - generic [ref=e24]:
      - paragraph [ref=e25]: No bookmarks
      - paragraph [ref=e26]: Bookmark questions while studying to find them here.
  - navigation [ref=e27]:
    - button "Home" [ref=e28]
    - button "Subjects" [ref=e32]
    - button "Progress" [ref=e35]
    - button "Bookmarks" [active] [ref=e37]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Dashboard', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/')
  6  |   })
  7  | 
  8  |   test('shows the InterviewPrep branding', async ({ page }) => {
  9  |     await expect(page.getByText('InterviewPrep')).toBeVisible()
  10 |   })
  11 | 
  12 |   test('shows the Start Interview button', async ({ page }) => {
  13 |     await expect(page.getByRole('button', { name: /start interview/i })).toBeVisible()
  14 |   })
  15 | 
  16 |   test('shows the Study button', async ({ page }) => {
  17 |     await expect(page.getByRole('button', { name: /study/i })).toBeVisible()
  18 |   })
  19 | })
  20 | 
  21 | test.describe('Navigation', () => {
  22 |   test('navigates to subjects from Study', async ({ page }) => {
  23 |     await page.goto('/')
  24 |     await page.getByRole('button', { name: /study/i }).click()
  25 |     await expect(page.getByText('Subjects')).toBeVisible()
  26 |   })
  27 | 
  28 |   test('goes back from subjects to dashboard', async ({ page }) => {
  29 |     await page.goto('/')
  30 |     await page.getByRole('button', { name: /study/i }).click()
  31 |     await page.getByRole('button', { name: /go back/i }).click()
  32 |     await expect(page.getByText('InterviewPrep')).toBeVisible()
  33 |   })
  34 | 
  35 |   test('navigates to About view', async ({ page }) => {
  36 |     await page.goto('/')
  37 |     await page.getByRole('button', { name: /about/i }).click()
  38 |     await expect(page.getByText('Fuat Yazar')).toBeVisible()
  39 |     await expect(page.getByText('MIT')).toBeVisible()
  40 |   })
  41 | 
  42 |   test('navigates to Progress view', async ({ page }) => {
  43 |     await page.goto('/')
  44 |     await page.getByRole('button', { name: /progress/i }).click()
  45 |     await expect(page.getByText('Progress')).toBeVisible()
  46 |   })
  47 | 
  48 |   test('navigates to Bookmarks view', async ({ page }) => {
  49 |     await page.goto('/')
  50 |     await page.getByRole('button', { name: /bookmark/i }).click()
> 51 |     await expect(page.getByText('Bookmarks')).toBeVisible()
     |                                               ^ Error: expect(locator).toBeVisible() failed
  52 |   })
  53 | })
  54 | 
  55 | test.describe('Theme toggle', () => {
  56 |   test('toggles light mode on and off', async ({ page }) => {
  57 |     await page.goto('/')
  58 |     const html = page.locator('html')
  59 |     await expect(html).not.toHaveClass(/light-mode/)
  60 |     await page.getByRole('button', { name: /toggle theme/i }).click()
  61 |     await expect(html).toHaveClass(/light-mode/)
  62 |     await page.getByRole('button', { name: /toggle theme/i }).click()
  63 |     await expect(html).not.toHaveClass(/light-mode/)
  64 |   })
  65 | })
  66 | 
  67 | test.describe('Font size controls', () => {
  68 |   test('increase font size button is visible', async ({ page }) => {
  69 |     await page.goto('/')
  70 |     await expect(page.getByRole('button', { name: /increase font size/i })).toBeVisible()
  71 |   })
  72 | 
  73 |   test('decrease font size button is disabled at minimum', async ({ page }) => {
  74 |     await page.goto('/')
  75 |     // Decrease twice to reach minimum
  76 |     await page.getByRole('button', { name: /decrease font size/i }).click()
  77 |     await page.getByRole('button', { name: /decrease font size/i }).click()
  78 |     await expect(page.getByRole('button', { name: /decrease font size/i })).toBeDisabled()
  79 |   })
  80 | })
  81 | 
```