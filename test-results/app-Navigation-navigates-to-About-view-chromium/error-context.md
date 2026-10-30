# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.test.ts >> Navigation >> navigates to About view
- Location: e2e\app.test.ts:35:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('MIT')
Expected: visible
Error: strict mode violation: getByText('MIT') resolved to 2 elements:
    1) <span class="text-sm font-semibold text-gray-100">MIT</span> aka getByText('MIT', { exact: true })
    2) <span>Open source — MIT License</span> aka getByText('Open source — MIT License')

Call log:
  - Expect "toBeVisible" getByText('MIT') with timeout 5000ms
  - waiting for getByText('MIT')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - button "Go back" [ref=e6]
    - heading "About" [level=1] [ref=e9]
    - generic [ref=e10]:
      - button "Decrease font size" [ref=e11]: A
      - button "Increase font size" [ref=e12]: A
      - button "Toggle theme" [ref=e13]
      - button "Open in full window" [ref=e20]
  - main [ref=e26]:
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]: IP
        - generic [ref=e33]:
          - heading "InterviewPrep" [level=1] [ref=e34]
          - paragraph [ref=e35]: Version 0.1.0
        - paragraph [ref=e36]: Offline-first technical interview preparation for software developers. Free, open-source, and fully offline.
      - separator [ref=e37]
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: Author
          - generic [ref=e41]: Fuat Yazar
        - generic [ref=e42]:
          - generic [ref=e43]: License
          - generic [ref=e44]: MIT
        - generic [ref=e45]:
          - generic [ref=e46]: Version
          - generic [ref=e47]: 0.1.0
      - separator [ref=e48]
      - generic [ref=e49]:
        - heading "Features" [level=2] [ref=e50]
        - generic [ref=e51]:
          - generic [ref=e56]:
            - paragraph [ref=e57]: Structured Question Banks
            - paragraph [ref=e58]: Curated questions across topics, levels, and types — single choice, multiple select, code output, and open-ended.
          - generic [ref=e63]:
            - paragraph [ref=e64]: Interview Simulation
            - paragraph [ref=e65]: Timed quiz sessions with scoring, answer review, and session history.
          - generic [ref=e72]:
            - paragraph [ref=e73]: Local-first Persistence
            - paragraph [ref=e74]: All progress, bookmarks, and preferences are stored locally in IndexedDB. Nothing leaves your device.
          - generic [ref=e79]:
            - paragraph [ref=e80]: No Account Required
            - paragraph [ref=e81]: No sign-up, no tracking, no internet connection needed. Works fully offline.
      - separator [ref=e82]
      - generic [ref=e83]:
        - heading "Content" [level=2] [ref=e84]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]: TypeScript
            - generic [ref=e88]: 155 questions
          - generic [ref=e89]:
            - generic [ref=e90]: Basics
            - generic [ref=e91]: Interfaces & Types
            - generic [ref=e92]: Functions
            - generic [ref=e93]: Generics
            - generic [ref=e94]: Classes
            - generic [ref=e95]: Advanced Types
        - paragraph [ref=e96]: More subjects coming in future releases.
      - separator [ref=e97]
      - generic [ref=e98]:
        - heading "Built With" [level=2] [ref=e99]
        - generic [ref=e100]:
          - generic [ref=e101]:
            - generic [ref=e102]: React 19
            - generic [ref=e103]: UI
          - generic [ref=e104]:
            - generic [ref=e105]: TypeScript 5.7
            - generic [ref=e106]: Language
          - generic [ref=e107]:
            - generic [ref=e108]: Vite 6
            - generic [ref=e109]: Build
          - generic [ref=e110]:
            - generic [ref=e111]: Tailwind CSS v4
            - generic [ref=e112]: Styling
          - generic [ref=e113]:
            - generic [ref=e114]: Dexie / IndexedDB
            - generic [ref=e115]: Storage
          - generic [ref=e116]:
            - generic [ref=e117]: Zustand
            - generic [ref=e118]: State
      - generic [ref=e119]: Open source — MIT License
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
> 39 |     await expect(page.getByText('MIT')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
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
  51 |     await expect(page.getByText('Bookmarks')).toBeVisible()
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